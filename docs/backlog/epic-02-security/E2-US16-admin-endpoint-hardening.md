# E2-US16: Admin Endpoint Hardening

**User Story**: As a platform operator, I want admin endpoints to have rate limiting, input validation, and consistent error responses so that privileged operations cannot be abused for enumeration or denial-of-service attacks.

**Acceptance Criteria**:
- [ ] `POST /admin/unlock-account/:email` validates the email parameter format before processing
- [ ] `POST /admin/unlock-account/:email` is rate-limited (e.g., 10 requests per 15 minutes)
- [ ] The unlock-account response does not reveal whether the email exists (returns same message for valid and invalid emails)
- [ ] All future admin endpoints follow the same pattern: rate limiting + input validation + generic responses
- [ ] Admin actions are audited with the acting admin's user ID in the log entry

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `@RateLimit` decorator to unlock-account endpoint | packages/api/src/controllers/admin.controller.ts |
| API | Add email format validation on the `:email` param (Zod or regex guard) | packages/api/src/controllers/admin.controller.ts |
| API | Return generic response regardless of whether the email exists | packages/api/src/controllers/admin.controller.ts |
| API | Include admin user ID in audit log (currently only logs IP) | packages/api/src/controllers/admin.controller.ts |
| API | Unit tests for validation and rate limiting | packages/api/src/controllers/admin.controller.test.ts |
| E2E | Test rate limiting and generic response for admin endpoints | e2e/tests/auth.api.spec.ts |

**Dependencies**: E2-US05

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Invalid email format is rejected
  Given I am authenticated as an admin
  When I call POST /admin/unlock-account/not-an-email
  Then the response should be 400 Bad Request

Scenario: Unlock-account returns same response for unknown email
  Given I am authenticated as an admin
  When I call POST /admin/unlock-account/nonexistent@example.com
  Then the response should be 200 with a generic success message
  And the message should not reveal whether the email exists

Scenario: Admin unlock-account is rate limited
  Given I am authenticated as an admin
  When I call POST /admin/unlock-account 11 times in 15 minutes
  Then the 11th request should return 429 Too Many Requests

Scenario: Admin user ID is recorded in audit log
  Given I am authenticated as admin (user-admin-1)
  When I call POST /admin/unlock-account/user@example.com
  Then the audit log entry should include userId: user-admin-1
```
