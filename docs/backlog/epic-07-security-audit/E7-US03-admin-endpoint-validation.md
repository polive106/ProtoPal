# E7-US03: Admin Endpoint Input Validation

**User Story**: As a platform operator, I want admin endpoint parameters to be validated so that malformed input cannot reach the database layer and error responses do not leak internal details.

**Acceptance Criteria**:
- [ ] `POST /admin/unlock-account/:email` validates the email parameter format before processing
- [ ] Invalid email format returns 400 Bad Request with a generic message
- [ ] Response uses a generic success message instead of echoing the email back
- [ ] Non-existent email returns the same generic message (no enumeration)
- [ ] Unit tests cover valid, invalid, and non-existent email scenarios

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add Zod email validation pipe to `:email` route param | packages/api/src/controllers/admin.controller.ts |
| API | Replace response message that echoes the email with a generic message | packages/api/src/controllers/admin.controller.ts |
| API | Unit tests for email validation and generic responses | packages/api/src/controllers/admin.controller.test.ts |

**Dependencies**: None

**Complexity**: XS

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Invalid email format is rejected
  Given I am authenticated as admin
  When I call POST /admin/unlock-account/not-an-email
  Then I should receive a 400 Bad Request

Scenario: Valid email returns generic success
  Given I am authenticated as admin
  When I call POST /admin/unlock-account/user@example.com
  Then I should receive a generic "Account unlock processed" message

Scenario: Non-existent email returns same generic message
  Given I am authenticated as admin
  When I call POST /admin/unlock-account/nobody@example.com
  Then I should receive the same generic message (no enumeration)
```
