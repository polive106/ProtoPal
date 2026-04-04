# AGENTS.md

## Project Overview

<!-- Customize this section for your project -->
A fullstack monorepo with authentication, RBAC, and an example CRUD entity (Notes). Built for agentic development workflows with hexagonal architecture, TDD, and E2E testing mandates.

## Key Resources

| Resource | Purpose |
|----------|---------|
| `docs/backlog/` | User stories organized by epic |
| `docs/backlog/README.md` | PRD overview: domain model, API contracts, implementation order |
| `adr/` | Architecture Decision Records (MADR format) |
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

### Key Differences from Frontend
- **`testID`** prop (not `data-testid`) — React Native convention, used by Maestro
- **NativeWind** for styling (Tailwind CSS → React Native styles)
- **Expo Router** for file-based routing (`app/` directory)
- **`expo-secure-store`** for token storage (not cookies)
- **Bearer token** auth (not cookie-based)

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

## Process Rules

- **Use `pnpm add`** to install deps, never edit package.json directly
- **Before committing**, always run:
  1. `pnpm lint` — fix any TypeScript/linting errors
  2. `pnpm test` — ensure all tests pass

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
npx playwright install --with-deps    # Required before first run
pnpm test:e2e                         # Run all
pnpm test:e2e --project=api           # API tests only
pnpm test:e2e --headed                # With visible browser
```

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

# Testing
pnpm test                               # All unit tests
pnpm --filter @acme/domain test:watch   # TDD mode
pnpm test:e2e                           # E2E tests (Playwright)
pnpm test:e2e:mobile                    # Mobile E2E (Maestro — requires device/emulator)

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
