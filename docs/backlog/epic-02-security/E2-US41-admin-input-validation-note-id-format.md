# E2-US41: URL Parameter Validation (Admin Email & Note ID)

**User Story**: As a platform operator, I want all URL path parameters to be validated for expected format so that malformed inputs are rejected early and cannot trigger unexpected behavior in downstream queries.

**Acceptance Criteria**:
- [ ] `POST /admin/unlock-account/:email` validates the email parameter with Zod email schema
- [ ] `GET /notes/:id`, `PATCH /notes/:id`, `DELETE /notes/:id` validate the id parameter format (e.g., UUID)
- [ ] Invalid parameters return 400 Bad Request with a generic error message
- [ ] Validation uses the existing `ZodValidationPipe` for consistency

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add Zod email validation to admin unlock-account `:email` param | packages/api/src/controllers/admin.controller.ts |
| API | Add Zod UUID validation to notes `:id` params | packages/api/src/controllers/notes.controller.ts |
| API | Unit tests for invalid param rejection | packages/api/src/controllers/admin.controller.test.ts, notes.controller.test.ts |
| E2E | Test that malformed IDs return 400 | e2e/tests/notes.api.spec.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Admin unlock rejects invalid email format
  Given I am an admin
  When I call POST /admin/unlock-account/not-an-email
  Then the response should be 400 Bad Request

Scenario: Notes endpoint rejects non-UUID id
  Given I am authenticated
  When I call GET /notes/not-a-valid-id
  Then the response should be 400 Bad Request

Scenario: Notes endpoint accepts valid UUID id
  Given I am authenticated
  When I call GET /notes/550e8400-e29b-41d4-a716-446655440000
  Then the response should proceed to lookup (404 if not found, not 400)
```
