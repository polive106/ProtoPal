---
name: commit
description: Automates pre-commit workflow: lint, test, review changes, then commit with conventional commit format.
disable-model-invocation: true
---

## Prerequisite

Run `/simplify` and `/review` **before** this skill, and apply what they find. Both
rewrite source, so a suite run before them is invalidated by the very next edit.

This skill owns the gate: it is the **only** place the full E2E suite runs, and it runs
once, here, on source that has stopped moving.

## Steps

1. **Run lint**: `pnpm lint`
   - Fix any TypeScript errors
2. **Run unit tests**: `pnpm test`
   - Fix any failing tests
3. **Run the full E2E suite**: `pnpm test:e2e` (api + chromium — the same set as CI)
   - Add `pnpm test:e2e:mobile` only if the mobile layer changed
   - On failure, re-run **only** the failing spec (by path, or `--grep "<title>"`)
     until it is green, then re-run the suite once to confirm
   - Stop and report after two identical failures — a third run will not fix it
4. **Review changes**: `git diff --staged`
5. **Format commit message** using conventional commits:
   - `feat: add note deletion`
   - `fix: correct login redirect`
   - `refactor: extract auth guard logic`
   - `test: add notes CRUD e2e tests`
   - `docs: update getting started guide`
6. **Commit**: `git commit -m "type: description"`

## Avoid duplicate test runs

Steps 1–3 are the **only** full-suite run in the story. `/implement-story` does not run
them, and neither does `/story-complete` — both defer to this skill. Nothing else should
run `pnpm test:e2e`. See AGENTS.md → **Test Execution Policy**.

The `pre-commit` hook re-runs `pnpm lint` and `pnpm test` as a safety net. That is
expected; do not run them a third time by hand.

### Several commits in one story

Keep commits atomic, but do **not** pay for the E2E suite on each one. Run steps 1–3 on
the commit that **completes** the story. For an intermediate commit you will build on in
the same story, skip step 3 and use the narrow rungs instead
(`pnpm test:e2e:api`, or the single spec you touched) — the completing commit covers the
whole change.

## Conventional Commit Types

| Type | When |
|------|------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `docs` | Documentation changes |
| `chore` | Build, CI, or tooling changes |
| `style` | Formatting, whitespace (no code change) |

## Guidelines
- Keep commits atomic (one logical change per commit)
- Write clear, descriptive commit messages
- Reference story IDs when applicable: `feat(E1-US03): add notes CRUD`
