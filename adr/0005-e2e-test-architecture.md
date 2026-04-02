# ADR-0005: E2E Test Architecture

## Status

Accepted

## Context

We need end-to-end tests that verify the full stack (API + UI) works together. Tests should be reliable, fast to write, and resistant to UI refactors that don't change behavior.

## Decision

We adopted **Playwright** with the following architecture:

- **`data-testid` selectors only** — no CSS selectors, no text matching. Naming convention: `{page}-{element-type}-{name}` in kebab-case (e.g., `login-input-email`, `notes-btn-edit-{id}`).
- **Two test projects**: `@api` (API-level tests via `request`) and `@ui` (browser tests via `page`). API tests run first; UI tests depend on them.
- **Dedicated E2E database** — a separate SQLite file seeded before each run, isolated from development data.
- **Shared fixtures** — API helpers, test credentials, and `data-testid` constants live in `e2e/fixtures/`.
- **Tag-based execution** — `@api` and `@ui` tags allow running subsets independently.

## Consequences

### Positive
- `data-testid` selectors are immune to styling and text changes — tests break only when behavior changes
- Separate API/UI projects let us catch backend regressions without browser overhead
- Dedicated database prevents test pollution of development data
- Playwright's multi-browser support (Chromium, Firefox, WebKit) covers cross-browser scenarios

### Negative
- Every interactive element needs a `data-testid` attribute added to the component
- Two test projects means two configurations to maintain
- E2E tests are inherently slower than unit tests — must be selective about what to cover

## Alternatives Considered
- **Cypress**: Strong DX but slower multi-browser support and no native API testing project separation
- **Testing Library integration tests only**: Faster but don't verify real HTTP, routing, or browser behavior
- **Manual QA**: Doesn't scale and can't run in CI
