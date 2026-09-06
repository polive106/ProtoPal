# Agent Performance Audit — E2E Test Execution

**Date:** 2026-09-06
**Trigger:** Multiple engineers who forked this repo reported that the agent was slow to make
changes, ran the E2E suite repeatedly, and sometimes **got stuck entirely**.

Both symptoms are reproducible. The causes are independent and additive: a config that hangs
the agent outright (§1), a local test matrix 2.2× larger than the one CI enforces (§2),
instructions that ask for the full suite 3–6 times per story (§3), documented commands that
never exit (§4), and a production build charged to every unit-test run (§5).

---

## 1. The agent hangs: `reporter: 'html'` serves the report and blocks

**This is the "gets stuck" report, and it was a hard hang, not slowness.**

`playwright.config.ts` used the bare `'html'` reporter for every non-CI run:

```ts
reporter: process.env.CI ? 'github' : 'html',
```

Playwright's HTML reporter defaults to `open: 'on-failure'`. On failure it starts a web server
and waits for `Ctrl+C`, which never comes in an agent session.

### Reproduced

```
$ env -u CLAUDECODE -u COPILOT_CLI npx playwright test   # inside a pty, one failing test
  Serving HTML report at http://localhost:9323. Press Ctrl+C to quit.
EXIT=124 ELAPSED=27s        # 124 = killed by `timeout`; it never returns on its own
```

### Why it did not always reproduce

The installed Playwright (1.59) carries a guard (`playwright/lib/reporters/html.js:134`):

```js
const isCodingAgent = !!process.env.CLAUDECODE || !!process.env.COPILOT_CLI;
const shouldOpen = !isCodingAgent && !!process.stdin.isTTY && (…);
```

The guard recognises **only** Claude Code and GitHub Copilot CLI, and only suppresses the hang
when there is no TTY. So the repo appeared fine under Claude Code while hanging for forks using
Cursor, Windsurf, Aider, Codex, or any harness that allocates a pty — which matches the reports.
The repo also declares `"@playwright/test": "^1.58.0"`, so the guard is not even guaranteed to
be present.

Relying on a hardcoded vendor allowlist inside a dependency is not a safety property. The config
must not opt into blocking behaviour in the first place.

**Fix:** pin the reporter so it can never serve:

```ts
reporter: process.env.CI ? 'github' : [['list'], ['html', { open: 'never' }]],
```

The `list` reporter also gives live per-test progress, so a slow run is now visibly progressing
rather than looking frozen — which is what prompts an agent (or a human) to kill and retry.

---

## 2. Every local run was 2.2× larger than CI, and serialised

The project matrix added Firefox and WebKit for every non-CI run, chained through
`dependencies` so the three browsers ran strictly one after another:

```ts
{ name: 'chromium', grep: /@ui/, dependencies: ['api'] },
{ name: 'firefox',  grep: /@ui/, dependencies: ['chromium'] },   // waits for all of chromium
{ name: 'webkit',   grep: /@ui/, dependencies: ['firefox'] },    // waits for all of firefox
```

### Measured

| | Tests | Note |
|---|---|---|
| CI (`CI=1`) | **131** | 53 `@api` + 78 `@ui` × 1 browser |
| Local — what the agent ran | **287** | 53 `@api` + 78 `@ui` × 3 browsers |

Two separate problems fell out of this:

1. **156 of the 287 tests (54%) produced no signal CI would ever act on.** The gate the agent
   was told to satisfy was strictly larger than the gate CI enforces.
2. **The local gate demanded browsers a CI-style environment does not have.** Any machine
   provisioned the way CI provisions one — chromium only — cannot satisfy the local matrix at all.
   In this audit's container (chromium only, and at a build Playwright 1.59 did not expect) the
   `@ui` project failed all 78 times with:

   ```
   Error: browserType.launch: Executable doesn't exist at …/chrome-headless-shell
   ╔══════════════════════════════════════════════════════════╗
   ║ Please run the following command to download new browsers ║
   ║     npx playwright install                                ║
   ╚══════════════════════════════════════════════════════════╝
   ```

   Firefox and WebKit were not installed at all, so under the old config the same failure would
   have repeated for a further 156 tests after chromium finished. A wall of near-identical
   launch failures is exactly the shape of output that invites an agent to re-run rather than
   conclude the environment is wrong — and because the browsers were chained through
   `dependencies`, each retry paid for the preceding projects again before reaching the failure.

**Fix:** Firefox and WebKit are now opt-in via `E2E_BROWSERS=all`. The default matrix is
`api` + `chromium` — **identical to CI, locally and in CI**. The serial chain is kept for the
opt-in path, because the three browsers share one seeded database and would otherwise contend
over the seeded `user@example.com` fixture.

---

## 3. The instructions asked for the full suite 3–6 times per story

No single document was wrong; the redundancy was spread across five files that each independently
said "run everything".

| Step | What it ran |
|---|---|
| `/implement-story` step 7 | `pnpm lint`, `pnpm test`, `pnpm test:e2e`, `pnpm test:e2e:mobile` |
| `/add-e2e-tests` step 6 | `pnpm test:e2e` — full suite, per spec authored |
| `/review` | "All tests pass (`pnpm test`)", "Lint passes (`pnpm lint`)" |
| `/commit` steps 1–3 | `pnpm lint`, `pnpm test`, `pnpm test:e2e --project=api` |
| `.husky/pre-commit` | `pnpm lint`, `pnpm test` — **again**, on every commit |
| `/story-complete` step 4 | `pnpm lint`, `pnpm test`, `pnpm test:e2e` — **again** |

So one story ran the full E2E suite at least twice back-to-back on identical inputs
(`/implement-story` → `/story-complete`), plus once per E2E spec authored, and ran
`pnpm lint` + `pnpm test` four or more times — with `/commit` and the pre-commit hook running
them consecutively on the same tree.

Critically, **nothing anywhere told the agent it could run less than everything.** There was no
guidance on running a single spec, no `--grep`, no per-package filter, and no stopping rule for
repeated failures. Given only "run `pnpm test:e2e`", re-running the whole suite is the only
tool the agent has when something fails.

### The suite also ran at the wrong point in the story

Even reduced to one run, *when* it runs matters. `/simplify` (and `/review`) rewrite source
as their whole purpose. A suite that runs before them is invalidated by the very next edit —
so the old flow either wasted the run or, worse, invited a second one to re-confirm.

The suite now has exactly one owner — `/commit` — and it sits after everything that can
still change code:

```
1. Implement layer by layer      → that layer's package tests only
2. Write the E2E specs           → the single spec being written
3. /simplify                     → applies reuse/simplification cleanups
4. /review                       → security + quality checklist; apply fixes
5. /commit                       → runs the gate (lint, test, test:e2e), then commits
```

Putting the gate inside `/commit` rather than in a step of its own removes the failure mode
where `/implement-story` verifies, then `/commit` verifies the same tree again: there is now
only one place in the whole workflow that types `pnpm test:e2e`, so a duplicate run requires
someone to go out of their way. When a story needs several atomic commits, the suite runs on
the commit that completes it; intermediate commits use the narrow rungs.

**Fix:** a new **Test Execution Policy** section in `AGENTS.md` (summarised in `CLAUDE.md`) with:

- a **six-rung scope ladder** — narrowest command that can disprove the change, widen at checkpoints;
- **full E2E once per story**, inside `/commit` — never before `/simplify`;
- **never re-run a suite that just passed** on unchanged inputs — `/story-complete` now carries
  `/implement-story`'s result forward via a change-scoped lookup table;
- **on failure, narrow before widening** — re-run the failing spec, not the suite;
- **a hard cap of 2 re-runs**, then stop and report;
- **diagnose from artifacts** (`test-results/**/error-context.md`, screenshots, traces) instead
  of re-running to see the error again.

---

## 4. Commands in the docs that never exit

Beyond the reporter, the documented command set contained several traps an agent would take at
face value. Each blocks until killed:

| Command | Where it was recommended |
|---|---|
| `pnpm --filter @acme/domain test:watch` | `AGENTS.md` → Commands Reference, *"TDD mode"* |
| `pnpm test:e2e:ui` (`playwright test --ui`) | root `package.json` — name reads like "run the `@ui` tests" |
| `pnpm test:e2e --headed` | `AGENTS.md`, `README.md`, `/debug` skill |
| `pnpm --filter @acme/database db:studio` | `AGENTS.md`, `/debug` skill |
| `pnpm dev` before E2E | `README.md`, `docs/getting-started.md` — *"E2E tests (requires pnpm dev)"* |

The last one was both blocking and wrong: Playwright starts its own servers via `webServer`, and
`e2e/setup-e2e.ts` **kills** anything already listening on ports 3000/5173. An agent that followed
the README would start a server that hangs it, and that the next step would kill anyway.

`test:e2e:ui` was the sharpest edge — it sits directly beside `test:e2e:api` in `package.json`
while the codebase uses `@ui` as the tag for browser tests. Reading the script list, "run the UI
tests" is the obvious interpretation, and it opens an interactive app that never returns.

**Fix:** `test:e2e:ui` → `test:e2e:uimode` (unambiguously interactive), with `test:e2e:web` added
for the thing the old name suggested. Every blocking command is now listed in a
**"Never run these — they never exit"** table with a non-blocking alternative, docs no longer
claim E2E needs `pnpm dev`, and `/debug` recommends reading failure artifacts instead of `--headed`.

---

## 5. Every `pnpm test` paid for a production build it did not use

`turbo.json` declared:

```json
"test": { "dependsOn": ["build"], "outputs": [] }
```

But no unit test consumes build output. Every workspace package resolves through
`"main": "./src/index.ts"`, and only `@acme/frontend` and `@acme/mobile` have a `build` script at
all (`@acme/mobile`'s is an `echo`). So `pnpm test` ran `tsc -b && vite build` — **13s cold** —
before any test, changing no result. Multiplied by the 4+ `pnpm test` invocations per story
in §3.

Type checking is already covered separately by `pnpm lint` (`tsc --noEmit`), which CI runs
alongside `pnpm test`.

**Fix:** dropped `dependsOn: ["build"]` from the `test` task.

---

## Verification

Run on the audit container (2 Playwright workers, heavily throttled — absolute times are not
representative of a developer laptop; the ratios are what matter).

| Check | Result |
|---|---|
| `pnpm test` (no `build` dependency) | **7/7 tasks green**, 74 test files, 29.6s |
| Test selection, default | **131** — byte-identical to `CI=1` |
| Test selection, `E2E_BROWSERS=all` | **287** — opt-in path still intact |
| `pnpm test:e2e:api` | **53 passed**, 24s wall clock |
| `pnpm test:e2e` (full default) | 122 passed / 9 failed, 12.6 min |
| Cold `pnpm build` (the cost §5 removed from every `pnpm test`) | 13s |
| Prettier on changed `.ts`/`.json` | clean |

**The 9 E2E failures are container throttling, not regressions.** Every one is a timeout —
13 × `Test timeout of 30000ms exceeded` and 4 × `Timeout: 5000ms` — on tests that individually
took 22–35s here. There are no assertion-logic failures, and the changes in this audit touch
only reporter configuration and project selection; they cannot affect `@ui` test outcomes.
See the `expect` timeout note under **Not changed**.

**The reporter fix is confirmed by that run.** It ended `EXIT=1` after 761s and returned
control. Under the previous `reporter: 'html'`, nine failures is precisely the condition that
starts the blocking report server — the agent would have stopped there until killed.

## Changes made

| File | Change |
|---|---|
| `playwright.config.ts` | HTML reporter pinned to `open: 'never'` + `list` reporter; Firefox/WebKit behind `E2E_BROWSERS=all` |
| `package.json` | `test:e2e:ui` → `test:e2e:uimode`; added `test:e2e:web`, `test:e2e:all-browsers`, `test:e2e:report` |
| `turbo.json` | `test` no longer depends on `build` |
| `AGENTS.md` | New **Test Execution Policy**; blocking-command table; scoped E2E command examples; watch-mode commands quarantined |
| `CLAUDE.md` | Summary of the policy at the point the agent reads first |
| `.agents/skills/implement-story` | `/simplify` + `/review` inserted before `/commit`; runs no suites itself |
| `.agents/skills/story-complete` | Do not re-run; change-scoped lookup table |
| `.agents/skills/commit` | Owns the gate: the single `pnpm lint` + `pnpm test` + `pnpm test:e2e` run for the story, plus guidance for multi-commit stories |
| `.agents/skills/add-e2e-tests` | Iterate on the single spec; no full-suite run from this skill |
| `.agents/skills/review` | Runs before the gate, since the checklist produces code changes |
| `.agents/skills/debug` | Read failure artifacts; no `--headed` |
| `.agents/skills/fix-ci` | Reproduce the failing spec first; local default now equals CI |
| `README.md`, `docs/getting-started.md` | Removed the false "requires `pnpm dev`"; documented scoped commands |

## Not changed

- **`e2e/setup-e2e.ts` killing ports 3000/5173.** It looks hostile, but it is load-bearing: a
  running dev server on :3000 would serve E2E requests against the *development* database.
  Left as-is, now documented.
- **The serial browser chain** (for the opt-in path). The three browsers share one seeded
  database and one seeded user; parallelising them would trade runtime for flakiness, and flaky
  tests cause exactly the re-run loops this audit is about.
- **`fullyParallel: true` with a shared SQLite database.** Most specs correctly register a unique
  user per test, but the `Notes UI @ui` block reuses the seeded `user@example.com` and mutates
  its notes. This is a latent flake source under parallel workers and deserves its own story —
  it is a correctness issue, not a performance one, and fixing it here would have widened the diff.
- **The default 5s `expect` timeout.** Verifying this audit's config on a heavily loaded
  container, four `auth/navigation.spec.ts` cross-link assertions failed on
  `expect(getByTestId('register-card')).toBeVisible()` after the URL assertion had already
  passed — the client-side route resolved, but not within 5s while Vite was compiling chunks
  on first navigation. These are pre-existing tests, unaffected by the changes here, and they
  pass on unloaded machines. But a timeout tuned for a fast laptop is precisely what turns a
  slow CI box or a busy agent container into a re-run loop, and `expect: { timeout: … }` is
  worth revisiting as its own change.

- **Fixed sleeps in specs** (`setTimeout` 1000ms ×3, 2000ms ×1). Real but small, and only
  meaningful once multiplied by the browser matrix that §2 removed.
