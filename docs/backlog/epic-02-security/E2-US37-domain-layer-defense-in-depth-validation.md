# E2-US37: Domain Layer Defense-in-Depth Validation

**User Story**: As a security engineer, I want domain use cases to enforce their own input validation independently of the API layer so that any future entry point (CLI tools, background jobs, message consumers) cannot bypass validation constraints.

**Acceptance Criteria**:
- [ ] `CreateNote.execute()` validates `title` length against `NOTE_TITLE_MAX` (255) and rejects oversized input
- [ ] `CreateNote.execute()` validates `content` length against `NOTE_CONTENT_MAX` (50,000) and rejects oversized input
- [ ] `UpdateNote.execute()` validates `title` and `content` lengths with the same limits
- [ ] Validation errors throw a domain-level `ValidationError` (not HTTP-specific errors)
- [ ] `INPUT_LIMITS` constants are importable by the domain package (moved to or re-exported from `@acme/shared` or `@acme/domain`)
- [ ] Domain unit tests verify rejection of oversized title and content inputs
- [ ] Existing API-level validation continues to work (defense in depth, not replacement)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Add title/content length validation to `CreateNote.execute()` | packages/domain/src/use-cases/CreateNote.ts |
| Domain | Add title/content length validation to `UpdateNote.execute()` | packages/domain/src/use-cases/UpdateNote.ts |
| Domain | Ensure `INPUT_LIMITS` or equivalent constants are accessible from domain | packages/domain/src/constants.ts or packages/shared/src/constants.ts |
| Domain | Add domain-level `ValidationError` if not already present | packages/domain/src/errors.ts |
| Domain | Unit tests for CreateNote with oversized title | packages/domain/src/use-cases/CreateNote.test.ts |
| Domain | Unit tests for CreateNote with oversized content | packages/domain/src/use-cases/CreateNote.test.ts |
| Domain | Unit tests for UpdateNote with oversized inputs | packages/domain/src/use-cases/UpdateNote.test.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: CreateNote rejects title exceeding max length
  Given a note title with 256 characters
  When CreateNote.execute() is called
  Then it should throw a ValidationError with message containing "title"

Scenario: CreateNote rejects content exceeding max length
  Given note content with 50,001 characters
  When CreateNote.execute() is called
  Then it should throw a ValidationError with message containing "content"

Scenario: UpdateNote rejects oversized title
  Given an existing note owned by the user
  And an update with a title of 256 characters
  When UpdateNote.execute() is called
  Then it should throw a ValidationError

Scenario: CreateNote accepts valid-length inputs
  Given a title of 255 characters and content of 50,000 characters
  When CreateNote.execute() is called
  Then the note should be created successfully
```
