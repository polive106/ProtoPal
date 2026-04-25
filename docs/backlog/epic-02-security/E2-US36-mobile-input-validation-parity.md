# E2-US36: Mobile Input Validation Parity

**User Story**: As a platform operator, I want mobile form validation schemas to enforce the same length limits as the web frontend so that oversized payloads are rejected client-side before reaching the API.

**Acceptance Criteria**:
- [ ] Mobile note form schema uses `INPUT_LIMITS.NOTE_TITLE_MAX` (255) and `INPUT_LIMITS.NOTE_CONTENT_MAX` (50000) from `@acme/shared`
- [ ] Mobile auth schemas enforce the same max-length rules as frontend (email max, password max 72, name max)
- [ ] All mobile Zod schemas import limits from `@acme/shared/constants` (single source of truth)
- [ ] Validation error messages are user-friendly and localized via i18n
- [ ] No discrepancy between mobile and web client-side validation rules

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Mobile | Import `INPUT_LIMITS` from `@acme/shared` in note form schema | packages/mobile/src/features/notes/schemas.ts |
| Mobile | Add `.max()` constraints to note title and content fields | packages/mobile/src/features/notes/schemas.ts |
| Mobile | Audit auth schemas for max-length parity with frontend | packages/mobile/src/features/auth/schemas.ts |
| Mobile | Unit tests for max-length validation | packages/mobile/src/features/notes/schemas.test.ts |

**Dependencies**: E4-US01

**Complexity**: XS

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Note title exceeding max length is rejected
  Given I enter a note title with 256 characters
  When validation runs
  Then it should fail with a max-length error

Scenario: Note content exceeding max length is rejected
  Given I enter note content with 50001 characters
  When validation runs
  Then it should fail with a max-length error

Scenario: Valid note passes validation
  Given I enter a title with 100 characters and content with 500 characters
  When validation runs
  Then it should pass
```
