# E4-US01: Share Validation Schemas via @acme/shared

**User Story**: As a developer, I want auth validation schemas defined once in `@acme/shared` so that the frontend and mobile packages stay in sync without copy-paste.

**Acceptance Criteria**:
- [ ] `loginSchema` and `registrationSchema` (Zod) live in `@acme/shared`
- [ ] `packages/frontend/src/features/auth/schemas.ts` re-exports from `@acme/shared`
- [ ] `packages/mobile/src/features/auth/schemas.ts` re-exports from `@acme/shared`
- [ ] Existing tests continue to pass without modification
- [ ] `zod` is added as a dependency to `@acme/shared`

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Shared | Add `zod` dependency and create auth schemas | packages/shared/package.json, packages/shared/src/schemas/auth.ts |
| Shared | Export schemas from package index | packages/shared/src/index.ts |
| Frontend | Replace local schemas with re-export from shared | packages/frontend/src/features/auth/schemas.ts |
| Mobile | Replace local schemas with re-export from shared | packages/mobile/src/features/auth/schemas.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: Frontend auth schemas come from shared
  Given I import loginSchema from @acme/shared
  When I validate a valid login payload
  Then validation passes identically to the previous local schema

Scenario: Mobile auth schemas come from shared
  Given I import registrationSchema from @acme/shared
  When I validate an invalid registration payload
  Then the same validation errors are returned as before
```
