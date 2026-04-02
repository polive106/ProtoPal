# ADR-0002: Frontend Feature Sliced Design

## Status

Accepted

## Context

We need a frontend architecture that:
- Scales with feature count without becoming a tangled dependency graph
- Makes features independently testable at each layer (state, presentation, composition)
- Gives clear ownership boundaries so developers know where code belongs
- Supports colocated tests that stay close to the code they verify

## Decision

We adopted a **Feature Sliced Design (FSD)** with a strict 3-layer separation inside each feature:

1. **Widgets** — stateless, props-only presentational components (zero hooks)
2. **Hooks** — own all state, effects, mutations, and error handling
3. **UI** — compose hooks + widgets, wire event handlers

Each feature (`features/auth/`, `features/notes/`, …) is a self-contained slice with its own `api.ts`, `schemas.ts`, and barrel `index.ts`. Tests are colocated next to the file they cover.

**Dependency rules:**
- `routes/` → `features/` (via barrel imports) → `lib/` (shared utilities)
- Never: features import routes; lib imports features; features import other features

## Consequences

### Positive
- Adding a feature is a single directory with a predictable structure
- Each layer can be tested in isolation (widget snapshots, hook unit tests, UI integration tests)
- Dependency violations are easy to spot in code review
- Barrel re-exports keep route files clean

### Negative
- More files per feature than a flat components/ approach
- New contributors need to learn the 3-layer convention
- Cross-feature interactions require lifting shared logic to `lib/`

## Alternatives Considered
- **Classic pages + components**: Simpler but doesn't scale — shared state and cross-cutting concerns create coupling
- **Atomic Design**: Good for design systems but doesn't address state management boundaries
- **Module-based (feature folders without layer separation)**: Less boilerplate but mixes state and presentation, harder to test in isolation
