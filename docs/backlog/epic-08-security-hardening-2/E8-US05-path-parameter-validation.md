# E8-US05: Path Parameter Validation Pipes

**User Story**: As a developer, I want all path parameters to be validated at the API boundary so that malformed IDs or emails are rejected early before reaching business logic or the database layer.

**Acceptance Criteria**:
- [ ] A reusable `UUIDValidationPipe` exists and rejects non-UUID strings with 400 Bad Request
- [ ] All `:id` path parameters in notes controller use the UUID validation pipe
- [ ] The admin `unlock-account/:email` parameter validates email format
- [ ] Invalid path parameters return a clear error message without leaking internals
- [ ] Unit tests cover valid and invalid inputs for each validation pipe

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Create `UUIDValidationPipe` that validates UUID v4 format | packages/api/src/common/pipes/uuid-validation.pipe.ts |
| API | Create `EmailValidationPipe` that validates email format | packages/api/src/common/pipes/email-validation.pipe.ts |
| API | Apply `UUIDValidationPipe` to `@Param('id')` in NotesController | packages/api/src/controllers/notes.controller.ts |
| API | Apply `EmailValidationPipe` to `@Param('email')` in AdminController | packages/api/src/controllers/admin.controller.ts |
| API | Unit tests for UUIDValidationPipe (valid UUID, invalid string, empty, SQL injection attempt) | packages/api/src/common/pipes/uuid-validation.pipe.test.ts |
| API | Unit tests for EmailValidationPipe | packages/api/src/common/pipes/email-validation.pipe.test.ts |
| E2E | Test that invalid note ID returns 400 | e2e/tests/notes.api.spec.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Valid UUID accepted
  Given a request to GET /notes/550e8400-e29b-41d4-a716-446655440000
  Then the request should reach the controller

Scenario: Invalid UUID rejected
  Given a request to GET /notes/not-a-uuid
  Then the response should be 400 Bad Request
  And the error should say "Invalid UUID format"

Scenario: SQL injection in ID rejected
  Given a request to GET /notes/1; DROP TABLE notes;--
  Then the response should be 400 Bad Request

Scenario: Valid email accepted for account unlock
  Given a request to POST /admin/unlock-account/user@example.com
  Then the request should reach the controller

Scenario: Invalid email rejected for account unlock
  Given a request to POST /admin/unlock-account/not-an-email
  Then the response should be 400 Bad Request
```
