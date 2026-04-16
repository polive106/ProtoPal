# E4-US08: Consolidate ApiError Class and Error Translation

**User Story**: As a developer, I want `ApiError` defined once and error translation applied consistently so that API error handling doesn't diverge across platforms.

**Acceptance Criteria**:
- [ ] `ApiError` class (including `errorKey` field) is defined in `@acme/shared` and imported by both frontend and mobile (currently duplicated with near-identical implementations)
- [ ] Mobile `useNoteForm` calls `translateApiError(error)` for `ApiError` instances (currently uses raw `error.message`, inconsistent with all other form hooks)
- [ ] `ERROR_KEYS` in `@acme/shared` uses `as const` satisfies pattern so values are derived from keys automatically (currently values are manually spelled-out copies of the keys, offering no typo protection)
- [ ] Remove unnecessary section comments in `error-key-map.ts` that explain obvious groupings; add a comment explaining the non-obvious mapping (`'Failed to retrieve user roles'` -> `INVALID_CREDENTIALS`)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Shared | Move `ApiError` class to `@acme/shared` | `packages/shared/src/api-error.ts` (new) |
| Shared | Export `ApiError` from package index | `packages/shared/src/index.ts` |
| Frontend | Import `ApiError` from `@acme/shared` instead of local definition | `packages/frontend/src/lib/api.ts` |
| Mobile | Import `ApiError` from `@acme/shared` instead of local definition | `packages/mobile/src/lib/api.ts` |
| Mobile | Use `translateApiError(error)` in `useNoteForm` `ApiError` branch | `packages/mobile/src/features/notes/hooks/useNoteForm.ts` |
| Shared | Refactor `ERROR_KEYS` to derive values from keys automatically | `packages/shared/src/error-keys.ts` |
| API | Clean up comments in error-key-map; add WHY comment for non-obvious mapping | `packages/api/src/common/filters/error-key-map.ts` |

**Dependencies**: None

**Complexity**: S

**Status**: To Do

**Test Scenarios**:
```gherkin
Scenario: Mobile note errors are translated
  Given a note API call returns an error with errorKey 'NOTE_NOT_FOUND'
  When the mobile useNoteForm catches the error
  Then translateApiError is called and the user sees a localized message

Scenario: ApiError consistency
  Given ApiError is defined in @acme/shared
  When frontend and mobile import ApiError
  Then both use the same class with identical behavior
```
