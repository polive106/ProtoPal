# E2-US15: API Route Parameter Validation & ID Format Enforcement

**User Story**: As a developer, I want all route parameters (`:id`) to be validated as UUIDs before reaching the database layer so that malformed or malicious IDs are rejected early and don't cause unexpected database behavior.

**Acceptance Criteria**:
- [ ] A reusable `ParseUUIDPipe` validates that `:id` parameters conform to UUID v4 format
- [ ] All parameterized endpoints (`GET /notes/:id`, `PATCH /notes/:id`, `DELETE /notes/:id`) use the pipe
- [ ] Invalid IDs return 400 Bad Request with a clear error message (not 404 or 500)
- [ ] The pipe is applied consistently via a decorator or global configuration
- [ ] Verification token in `GET /auth/verify?token=` is validated for format (non-empty, reasonable length)
- [ ] Unit tests verify UUID validation rejects non-UUID strings, SQL fragments, and empty strings
- [ ] E2E tests confirm valid UUID IDs still work normally

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Create `ParseUUIDPipe` that validates UUID v4 format | packages/api/src/common/pipes/parse-uuid.pipe.ts |
| API | Apply `ParseUUIDPipe` to all `:id` params in NotesController | packages/api/src/controllers/notes.controller.ts |
| API | Validate `token` query param format in verify endpoint | packages/api/src/controllers/auth.controller.ts |
| API | Unit tests for ParseUUIDPipe | packages/api/src/common/pipes/parse-uuid.pipe.test.ts |
| E2E | Test that malformed IDs return 400 | e2e/tests/notes.api.spec.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Valid UUID parameter is accepted
  Given an authenticated user with a note ID "550e8400-e29b-41d4-a716-446655440000"
  When they request GET /api/notes/550e8400-e29b-41d4-a716-446655440000
  Then the request proceeds to the controller normally

Scenario: Non-UUID parameter is rejected
  Given an authenticated user
  When they request GET /api/notes/not-a-uuid
  Then the response should be 400 Bad Request
  And the error should mention invalid ID format

Scenario: SQL injection in ID parameter is rejected
  Given an authenticated user
  When they request GET /api/notes/1; DROP TABLE notes;--
  Then the response should be 400 Bad Request

Scenario: Empty ID parameter is rejected
  Given an authenticated user
  When they request GET /api/notes/
  Then the response should be 400 or 404

Scenario: Verification token must be non-empty
  Given a verification request with an empty token
  When they request GET /api/auth/verify?token=
  Then the response should be 400 Bad Request
```
