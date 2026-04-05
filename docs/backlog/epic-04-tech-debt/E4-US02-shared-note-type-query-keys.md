# E4-US02: Share Note Type and Query Keys via @acme/shared

**User Story**: As a developer, I want the API-facing `Note` type and `queryKeys` object defined once in `@acme/shared` so that the frontend and mobile packages don't drift apart.

**Acceptance Criteria**:
- [ ] An API-facing `Note` interface (with string timestamps) is defined in `@acme/shared`
- [ ] A `queryKeys` object is defined in `@acme/shared`
- [ ] Frontend `features/notes/api.ts` imports `Note` from `@acme/shared` instead of defining it locally
- [ ] Mobile `features/notes/api.ts` imports `Note` from `@acme/shared` instead of defining it locally
- [ ] Frontend `lib/queryKeys.ts` re-exports from `@acme/shared`
- [ ] Mobile `lib/queryKeys.ts` re-exports from `@acme/shared`
- [ ] Existing tests continue to pass without modification

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Shared | Add API-facing Note interface | packages/shared/src/types.ts |
| Shared | Add queryKeys object | packages/shared/src/queryKeys.ts |
| Shared | Export new types from package index | packages/shared/src/index.ts |
| Frontend | Import Note from shared, remove local definition | packages/frontend/src/features/notes/api.ts |
| Frontend | Re-export queryKeys from shared | packages/frontend/src/lib/queryKeys.ts |
| Mobile | Import Note from shared, remove local definition | packages/mobile/src/features/notes/api.ts |
| Mobile | Re-export queryKeys from shared | packages/mobile/src/lib/queryKeys.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Frontend notes use shared Note type
  Given I import Note from @acme/shared
  When I use it in the frontend notes API
  Then TypeScript compiles without errors

Scenario: Mobile notes use shared Note type
  Given I import Note from @acme/shared
  When I use it in the mobile notes API
  Then TypeScript compiles without errors
```
