# E2-US17: Admin Endpoint Input Validation & Audit Trail

**User Story**: As a platform operator, I want admin endpoints to validate input parameters and produce complete audit trails so that administrative actions are safe and fully traceable.

**Acceptance Criteria**:
- [ ] `POST /admin/unlock-account/:email` validates the email parameter against the shared email schema (format + max length)
- [ ] Invalid email parameters return 400 Bad Request with appropriate error message
- [ ] Audit log entry includes the admin user's ID (from JWT) performing the unlock
- [ ] Admin actions are rate-limited to prevent abuse
- [ ] Unit tests verify email validation on admin endpoints
- [ ] Unit tests verify audit log includes admin user ID

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add email format/length validation to `unlockAccount` endpoint using Zod or `ParseEmailPipe` | packages/api/src/controllers/admin.controller.ts:23-40 |
| API | Extract admin user ID from request (via JWT/auth guard) and include in audit log | packages/api/src/controllers/admin.controller.ts:32-37 |
| API | Add `@RateLimit` decorator to admin unlock endpoint | packages/api/src/controllers/admin.controller.ts:23 |
| API | Add unit tests for input validation | packages/api/src/controllers/admin.controller.test.ts |
| API | Add unit tests for audit log completeness | packages/api/src/controllers/admin.controller.test.ts |

**Dependencies**: E2-US04 (Account Lockout — Done)

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Admin unlock rejects invalid email
  Given I am authenticated as an admin
  When I POST to /admin/unlock-account/not-an-email
  Then the response status should be 400
  And the error message should indicate invalid email format

Scenario: Admin unlock logs admin user ID
  Given I am authenticated as admin "admin@example.com" with ID "admin-123"
  When I POST to /admin/unlock-account/locked@example.com
  Then the audit log entry should include userId "admin-123"
  And the audit log entry should include action "ACCOUNT_UNLOCKED"
  And the audit log entry should include unlockedEmail "locked@example.com"

Scenario: Admin unlock is rate limited
  Given I am authenticated as an admin
  When I POST to /admin/unlock-account/user@example.com more than the rate limit
  Then the response status should be 429
```
