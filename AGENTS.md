# AGENTS.md

## Project Overview

<!-- Customize this section for your project -->
A fullstack monorepo with authentication, RBAC, and an example CRUD entity (Notes). Built for agentic development workflows with hexagonal architecture, TDD, and E2E testing mandates.

## Key Resources

| Resource | Purpose |
|----------|---------|
| `docs/backlog/` | User stories organized by epic |
| `docs/backlog/README.md` | PRD overview: domain model, API contracts, implementation order |
| `adr/` | Architecture Decision Records (MADR format) — **READ BEFORE making architectural decisions** |
| `.agents/skills/` | Development workflow skills (14 total) |
| `docs/getting-started.md` | Setup and development guide |

## Skills

| Skill | When to Use |
|-------|-------------|
| `discuss-feature` | Exploring and refining a new feature idea into stories |
| `create-story` | Creating new stories/epics in the backlog |
| `review-backlog` | Determining what to work on next, checking backlog status |
| `implement-story` | Starting work on a PRD story |
| `scaffold` | Creating entities, repos, controllers, components |
| `add-migration` | Changing database schema |
| `add-e2e-tests` | Writing E2E tests with data-testid selectors |
| `add-unit-tests` | Writing unit/integration tests |
| `review` | Before committing (security/quality checklist) |
| `redesign` | Redesigning a page/component to match the design system |
| `commit` | Pre-commit automation (lint, test, commit) |
| `debug` | Structured debugging workflow |
| `fix-ci` | CI failure resolution |
| `story-complete` | Post-implementation verification |

## Stack

**Monorepo**: pnpm workspaces + Turbo

| Package | Tech |
|---------|------|
| `@acme/shared` | Pure TypeScript (shared types) |
| `@acme/domain` | Pure TypeScript (entities, ports, use-cases) |
| `@acme/database` | Drizzle + SQLite (local) / PostgreSQL (prod) |
| `@acme/api` | NestJS + class-validator |
| `@acme/design-system` | Radix UI components |
| `@acme/frontend` | React + Vite + TanStack Router/Query + Tailwind |
| `@acme/mobile` | Expo + React Native + NativeWind + TanStack Query |
| `@acme/design-system-mobile` | Mobile Radix-inspired components (NativeWind) |

## Architecture Decision Records (ADRs)

**Before making any architectural decision**, read the relevant ADRs in `adr/`. ADRs document the reasoning behind past decisions and MUST be respected.

- **Read `adr/README.md`** to see the full index of decisions
- **Check for relevant ADRs** before proposing changes to: database layer, frontend architecture, testing strategy, package structure, or design system
- **If a proposed change contradicts an existing ADR**, discuss the conflict with the user before proceeding
- **New architectural decisions** should be captured as new ADRs following the MADR format in `adr/`

## Architecture Rules

**Hexagonal / Clean Architecture** — dependencies point inward:

1. **Domain has ZERO external dependencies** — no Drizzle, no NestJS, no React
2. Database implements Domain ports (adapters pattern)
3. API depends on Domain, not vice versa
4. Frontend knows nothing about Database internals

**Layer order when implementing**: Domain → Database → API → Frontend → Mobile → E2E

**E2E tests are the final mandatory step** — no feature is complete without them (Playwright for web, Maestro for mobile).

## Frontend Architecture (Feature Sliced Design)

Each frontend feature is a self-contained **slice** in `packages/frontend/src/features/`:

### Slice Structure
| File/Dir | Purpose |
|----------|---------|
| `api.ts` | TypeScript interfaces + API object wrapping `lib/api` |
| `widgets/` | Pure presentational React components — stateless, props-only, zero hooks |
| `hooks/` | Custom hooks — own all state, effects, mutations, error handling (one per file) |
| `ui/` | Composed feature implementations — wire hooks + widgets together |
| `schemas.ts` | Zod validation schemas (optional) |
| `constants.ts` | Feature-specific constants (optional) |
| `index.ts` | Barrel re-exporting all sub-layers |

**Test file convention**: colocate test files next to source files (e.g., `widgets/NoteCard.test.tsx`, `hooks/useNotes.test.ts`, `ui/NoteDrawer.test.tsx`). No `__tests__/` directories.

### Separation Principle (3 Layers)
- **Widgets**: stateless, receive all data via props, NEVER call hooks or `useState`/`useEffect`
- **Hooks**: own all state, effects, async operations, error handling, navigation
- **UI**: compose hooks + widgets, wire event handlers, manage page-level state

### Frontend Testing Strategy (3 Tiers)

| Tier | Location | What is real | What is mocked | Volume |
|------|----------|-------------|----------------|--------|
| Hook unit tests | `hooks/*.test.ts` | Hook logic, state | API module, queryClient, providers | Many |
| Widget tests | `widgets/*.test.tsx` | Component rendering, DOM | Nothing (props-only) | Moderate |
| Integration tests | `ui/*.test.tsx` | Hooks + Widgets wired together | API module only | Few |

### Frontend Development Workflow
1. **Hooks first** — write hook tests (RED), implement hooks (GREEN), refactor
2. **Widgets second** — write widget tests, implement widgets
3. **UI / Compose** — write integration test, wire hooks + widgets in ui/ component
4. **Routes** — thin wrapper that renders ui/ component with TanStack Router boilerplate
5. **E2E last** — Playwright tests for full stack

### Testing Rules
- **Hook tests**: `hooks/useX.test.ts` — use `renderHook()`, mock API/provider dependencies, test state changes + side effects
- **Widget tests**: `widgets/MyWidget.test.tsx` — use `render()`, test with mock props
- **Integration tests**: `ui/MyFeature.test.tsx` — use `render()`, mock only API boundary
- **One hook per file** → one colocated test file per hook

### Import Rules
- **Routes** import from features via barrel: `import { X } from '@/features/notes'`
- **Features** import shared utilities from `lib/` (`api`, `queryKeys`, `queryClient`)
- **Providers** import API contracts from `features/*/api.ts`
- **Never**: features import from routes; lib imports from features

### Form Pattern (TanStack Form + Zod)
- **Schemas** (`schemas.ts`): Zod objects for field-level validation, exported with `z.infer` types
- **Form hooks**: Use `useForm()` with `validators: { onChange: schema }`, `onSubmit` for API calls
- **Components**: Use `form.Field` render props — NO manual `useState` for field values
- **Utilities**: `handleFormSubmit()` wraps submit, `getFieldError()` extracts error messages
- Server errors use separate `useState<string | null>` (not field-level)

### Dependency Management
- **Always use `pnpm add`** to install or upgrade dependencies — never edit `package.json` version strings directly
- **Zod v4** is used across the monorepo (frontend + API) — Zod 4 supports Standard Schema v1 natively
- **`@tanstack/zod-form-adapter` is NOT needed** — TanStack Form v1 supports Zod 4 via Standard Schema directly
- **Zod 4 breaking change**: `.errors` getter removed from `ZodError` — use `.issues` instead

## Mobile Architecture (Feature Sliced Design)

The mobile app (`packages/mobile/`) mirrors the frontend architecture using React Native + Expo Router.

### Slice Structure (same as frontend)
| File/Dir | Purpose |
|----------|---------|
| `api.ts` | TypeScript interfaces + API object wrapping `lib/api` |
| `widgets/` | Pure presentational React Native components — stateless, props-only |
| `hooks/` | Custom hooks — state, effects, mutations (one per file) |
| `ui/` | Composed feature implementations — wire hooks + widgets |
| `schemas.ts` | Zod validation schemas |
| `index.ts` | Barrel re-exporting all sub-layers |

### Mobile Stack
- **Expo SDK 54** (stable, compatible with Expo Go)
- React Native 0.81 + React 19.1
- `pnpm dlx expo install` for Expo package updates (NOT `pnpm add`)

### Key Differences from Frontend
- **`testID`** prop (not `data-testid`) — React Native convention, used by Maestro
- **NativeWind** for styling (Tailwind CSS → React Native styles)
- **Expo Router** for file-based routing (`app/` directory)
- **`expo-secure-store`** for token storage (not cookies) — wrapped via `src/lib/secureStorage.ts` for web compatibility
- **Bearer token** auth (not cookie-based)

### Mobile Development Notes
- Metro config at `packages/mobile/metro.config.js` includes monorepo watchFolders
- After Expo package updates, run `pnpm dlx expo prebuild --clean` to regenerate native code
- `EXPO_PUBLIC_API_URL` env var overrides API endpoint (default: http://localhost:3000)

### Mobile Testing Strategy
| Tier | Location | What is real | What is mocked |
|------|----------|-------------|----------------|
| Hook unit tests | `hooks/*.test.ts` | Hook logic, state | API module, providers |
| Widget tests | `widgets/*.test.tsx` | Component rendering | RN components (mocked to DOM) |
| E2E (Maestro) | `maestro/flows/` | Full app | Nothing |

### Mobile testID Naming Convention
Same pattern as frontend: `{screen}-{element-type}-{name}` in kebab-case. Use `testID` prop on React Native components.

### Maestro E2E Tests
Mobile E2E tests use Maestro YAML flows in `packages/mobile/maestro/flows/`. Flows use `id:` selectors matching `testID` props.

```yaml
appId: com.acme.protopal
---
- launchApp:
    clearState: true
- tapOn:
    id: "login-input-email"
- inputText: "user@example.com"
- assertVisible:
    id: "dashboard-screen"
```

### Mobile E2E Prerequisites
Before running `pnpm test:e2e:mobile`:
1. Android emulator running (check: `adb devices`)
2. Maestro CLI installed (`curl -Ls "https://get.maestro.mobile.dev" | bash`)
3. APK built: `pnpm build:mobile`

## Process Rules

- **Use `pnpm add`** to install deps, never edit package.json directly
- **Before committing**, always run:
  1. `pnpm lint` — fix any TypeScript/linting errors
  2. `pnpm test` — ensure all tests pass

  The `pre-commit` hook runs both again as a safety net. Do not run them a third
  time by hand — see **Test Execution Policy**.

## TDD Rules

**NEVER write implementation code without a failing test first.**

Follow the Red-Green-Refactor cycle strictly:

1. **RED**: Write a failing test that describes the expected behavior
2. **GREEN**: Write the minimum code to make the test pass
3. **REFACTOR**: Clean up the code while keeping tests green

For each function/method:
```
1. Write test → Run test (must FAIL) → Write implementation → Run test (must PASS)
```

**Do NOT:**
- Write implementation first, then tests after
- Write all implementations, then write tests for only some of them
- Skip tests because "the code is simple"

**Test coverage:** Maximal coverage across all layers (domain, database, API, frontend). Every function, method, and component should be tested.

## E2E Test Rules

**Every implemented feature MUST have E2E tests.** A story is NOT complete without E2E tests.

### Selector Strategy: data-testid ONLY

**CRITICAL:** Always use `data-testid` selectors in E2E tests. Do NOT use `getByRole`, `getByLabel`, `getByText`.

```tsx
// In component — add data-testid
<Input data-testid="login-input-email" type="email" />
<Button data-testid="login-btn-submit">Sign In</Button>

// In test — use getByTestId
await page.getByTestId('login-input-email').fill(email);
await page.getByTestId('login-btn-submit').click();
```

### data-testid Naming Convention

Use kebab-case: `{page}-{element-type}-{name}`

| Type | Prefix | Example |
|------|--------|---------|
| Input | `input-` | `login-input-email` |
| Button | `btn-` | `login-btn-submit` |
| Link | `link-` | `login-link-register` |
| Alert | `alert-` | `login-alert-error` |
| Row | `row-` | `notes-row-{id}` |

### E2E File Structure

| Location | Purpose |
|----------|---------|
| `e2e/tests/` | All E2E test files organized by feature |
| `e2e/fixtures/` | Test helpers (credentials, API utilities) |
| `e2e/seed.ts` | Seed data for test scenarios |

### Running E2E Tests

```bash
npx playwright install --with-deps         # Required before first run
pnpm test:e2e                              # api + chromium (131 tests) — same set as CI
pnpm test:e2e:api                          # @api tests only (~25s) — no browser needed
pnpm test:e2e:web                          # @ui tests only (chromium)
pnpm test:e2e e2e/tests/notes/crud.spec.ts # One spec file
pnpm test:e2e --grep "should create"       # One test by title
E2E_BROWSERS=all pnpm test:e2e             # + Firefox/WebKit (287 tests, ~3x slower)
```

Firefox and WebKit are **opt-in**. By default the local suite runs exactly what
CI runs, so a green local run means a green CI run. Reach for `E2E_BROWSERS=all`
only for browser-specific changes (CSS, layout, browser APIs).

See **Test Execution Policy** below before running any suite.

## Test Execution Policy

Re-running broad test suites after every edit is the single biggest cause of slow
agent runs on this repo. **Run the narrowest command that can disprove the change
you just made**, and widen only at the checkpoints below.

### Scope ladder — pick the lowest rung that covers your change

| Rung | Use when | Command |
|------|----------|---------|
| 1 | Iterating on one function/component | `pnpm --filter @acme/<pkg> test -- <path>` |
| 2 | A layer is finished (domain, database, api, frontend) | `pnpm --filter @acme/<pkg> test` |
| 3 | Writing or fixing one E2E spec | `pnpm test:e2e e2e/tests/<feature>/<name>.spec.ts` |
| 4 | Checking a backend change mid-story, without a browser | `pnpm test:e2e:api` |
| 5 | Inside `/commit`, after `/simplify` and `/review` | `pnpm lint` + `pnpm test` |
| 6 | Inside `/commit` — **once** per story | `pnpm test:e2e` |

Rungs 1–4 are for iterating. Rungs 5–6 belong to `/commit` and nothing else — do not run
them yourself before invoking it.

### Story gate order

The full E2E suite runs **exactly once per story**, and it runs **last** — after every
step that can still change code, immediately before the commit:

```
1. Implement layer by layer      → rungs 1–2 (that layer's package tests only)
2. Write the E2E specs           → rung 3 (the single spec you are writing)
3. /simplify                     → applies reuse/simplification cleanups
4. /review                       → security + quality checklist; apply any fixes
5. /commit                       → runs the gate (lint, test, test:e2e), then commits
```

**`/commit` is the only place the full suite runs.** `/implement-story` does not run it;
`/story-complete` does not re-run it. If you find yourself typing `pnpm test:e2e`
outside `/commit`, you are about to duplicate a run.

**Do not run it before step 5 either.** `/simplify` and `/review` both rewrite source, so
any suite run before them is invalidated by the very next step — the clearest example of
the waste this policy exists to prevent. Steps 3 and 4 are cheap and change code; the
suite is expensive and only proves something once the code has stopped moving.

`/simplify` is provided by Claude Code. Under a harness that does not offer it, do the
equivalent cleanup pass by hand at step 3 — the ordering matters, not the tool.

### Rules

1. **The full E2E suite runs once per story, inside `/commit`** — not per layer, not
   after each test you add, and never before `/simplify`. When a story needs several
   atomic commits, the suite runs on the one that completes it.
2. **Never re-run a suite that just passed** when nothing it covers has changed.
   If `/implement-story` finished on a green `pnpm test:e2e`, `/story-complete`
   records that result instead of running it again.
3. **On failure, narrow before you widen.** Re-run only the failing spec
   (by path, or `--grep "<title>"`) until it is green, then re-run the suite
   **once** to confirm.
4. **Cap re-runs at 2.** A third identical failure is a real bug or a broken
   environment, never something a fourth run will fix — stop and report what
   failed, with the error text.
5. **Diagnose from artifacts, not from re-runs.** A failed run already wrote
   everything you need (see below).
6. **Cross-browser is opt-in** (`E2E_BROWSERS=all`) and is not part of the
   definition of done — CI does not run it either.

### Never run these — they never exit

An agent that starts one of these blocks until it is killed. If one is genuinely
needed, ask the user to run it.

| Command | Why it blocks | Use instead |
|---------|---------------|-------------|
| `pnpm dev`, `pnpm --filter … dev` | Persistent dev server | Playwright starts its own via `webServer` |
| `pnpm --filter … test:watch` | Vitest watch mode | `pnpm --filter … test` (`vitest run`) |
| `pnpm test:e2e:uimode` / `playwright test --ui` | Interactive UI mode | `pnpm test:e2e <spec>` |
| `pnpm test:e2e:headed` / `--headed` | Needs a display | Read the trace/screenshot artifacts |
| `pnpm test:e2e:report` / `playwright show-report` | Serves on `:9323` until Ctrl+C | Read `playwright-report/` from disk |
| `pnpm --filter @acme/database db:studio` | Persistent server | `pnpm --filter @acme/database db:seed` |

> The Playwright config deliberately pins the HTML reporter to `open: 'never'`.
> The bare `'html'` reporter defaults to `open: 'on-failure'`, which serves the
> report and blocks — do not change it back.

### Reading E2E failures without re-running

| Artifact | Contains |
|----------|----------|
| `test-results/**/error-context.md` | Page snapshot at the moment of failure |
| `test-results/**/*.png` | Screenshot (`screenshot: 'only-on-failure'`) |
| `test-results/**/trace.zip` | Full trace (`trace: 'on-first-retry'`) |
| `playwright-report/` | HTML report — written to disk, never served |

## Commands Reference

```bash
# Development
pnpm dev                                # All dev servers
pnpm --filter @acme/api dev             # API only (port 3000)
pnpm --filter @acme/frontend dev        # Frontend only (port 5173)
pnpm dev:mobile                         # Mobile dev (Expo)

# Database
pnpm --filter @acme/database db:push    # Apply schema to SQLite
pnpm --filter @acme/database db:seed    # Seed with sample data
pnpm --filter @acme/database db:studio  # Visual database explorer

# Testing (all of these exit on their own — safe for agents)
pnpm test                               # All unit tests
pnpm --filter @acme/domain test         # One package's unit tests
pnpm test:e2e                           # E2E tests (Playwright: api + chromium)
pnpm test:e2e:api                       # E2E @api tests only (fastest useful signal)
pnpm test:e2e:mobile                    # Mobile E2E (Maestro — requires device/emulator)

# Interactive — HUMANS ONLY, these never exit (see Test Execution Policy)
pnpm --filter @acme/domain test:watch   # Vitest watch (TDD mode)
pnpm test:e2e:uimode                    # Playwright UI mode
pnpm test:e2e:report                    # Serve the last HTML report on :9323

# Building
pnpm build                              # Build all packages
pnpm lint                               # Type check all packages
```

## Database Conventions

- **Column naming**: `snake_case` (e.g., `first_name`, `password_hash`)
- **Workspace refs**: `"@acme/domain": "workspace:*"`
- **IMPORTANT: Any schema change must update the seed script!**

When modifying `packages/database/src/schema.ts`:
1. Update `packages/database/src/seed.ts` to include the new table/columns
2. Add realistic sample data for new entities
3. Maintain referential integrity with existing seed data

## Project Conventions

- TanStack Query: Use `invalidateQueries` instead of `setQueryData` in mutation callbacks
- Use `removeQueries` to clear cache (not `setQueryData(key, null)`)
