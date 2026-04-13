# E8-US11: Route Parameter Validation

**User Story**: As a platform operator, I want API route parameters to be validated for expected format so that malformed IDs are rejected early and cannot cause unexpected behavior in downstream layers.

**Security Finding**: Note endpoints accept `:id` path parameters as raw strings with no format validation (`packages/api/src/controllers/notes.controller.ts` lines 70, 85, 108). The application uses UUID v4 for all entity IDs (generated via `crypto.randomUUID()`), but the API layer does not validate that path parameters conform to UUID format. While invalid IDs simply result in "not found" responses, validating at the boundary:
- Prevents unnecessary database lookups for obviously invalid IDs
- Blocks path traversal or injection attempts in URL parameters
- Provides clearer error messages to API consumers
- Follows defense-in-depth principles

**Current State**:
- `packages/api/src/controllers/notes.controller.ts`: `@Param('id') id: string` with no validation pipe
- `packages/api/src/controllers/admin.controller.ts`: `@Param('email') email: string` with no validation
- All entity IDs are UUID v4 format

**Acceptance Criteria**:
- [ ] A `ParseUUIDPipe` or Zod-based validation pipe validates `:id` parameters as valid UUID v4 format
- [ ] Invalid UUID format returns 400 Bad Request with a clear message
- [ ] All note endpoints use the validation pipe for `:id`
- [ ] Session endpoints (if implemented in E8-US08) also validate `:id`
- [ ] Unit tests verify rejection of non-UUID strings

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Create UUID validation pipe (or use NestJS ParseUUIDPipe) | packages/api/src/common/pipes/ |
| API | Apply to all note controller `:id` parameters | packages/api/src/controllers/notes.controller.ts |
| API | Integration tests for invalid UUID rejection | packages/api/src/controllers/notes.controller.integration.test.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Valid UUID is accepted
  Given I call GET /notes/550e8400-e29b-41d4-a716-446655440000
  Then the request proceeds to the handler

Scenario: Non-UUID string is rejected
  Given I call GET /notes/not-a-valid-uuid
  Then I receive a 400 Bad Request
  And the error message indicates an invalid ID format

Scenario: SQL injection attempt in ID is rejected
  Given I call GET /notes/1' OR '1'='1
  Then I receive a 400 Bad Request
```
