# E2-US29: Password Reset Flow Hardening

**User Story**: As a platform operator, I want the password reset submission endpoint to be rate-limited and to enforce email verification so that attackers cannot brute-force reset tokens or reset passwords for unverified accounts.

**Acceptance Criteria**:
- [ ] `POST /auth/reset-password` is rate-limited (e.g., 5 attempts per 15 minutes per IP)
- [ ] Password reset is rejected for accounts that have not verified their email address
- [ ] Failed reset attempts (invalid/expired token) are logged in the audit log
- [ ] After 3 consecutive failed reset token submissions from the same IP, all pending reset tokens for the target account are invalidated
- [ ] Rate limit responses include a `Retry-After` header

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `@RateLimit` decorator to `POST /auth/reset-password` endpoint | packages/api/src/controllers/auth.controller.ts |
| Domain | Add email verification check in `ResetPassword` use case | packages/domain/src/use-cases/ResetPassword.ts |
| Domain | Add failed attempt tracking and token invalidation logic | packages/domain/src/use-cases/ResetPassword.ts |
| API | Add audit log entries for failed reset attempts | packages/api/src/controllers/auth.controller.ts |
| Domain | Unit tests for email verification enforcement | packages/domain/src/use-cases/ResetPassword.test.ts |
| API | Unit tests for rate limiting on reset endpoint | packages/api/src/controllers/auth.controller.test.ts |
| E2E | Test rate limiting and verification enforcement | e2e/tests/password-reset.api.spec.ts |

**Dependencies**: E2-US06

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Reset-password endpoint is rate limited
  Given I submit 6 password reset requests in 15 minutes
  When I submit the 6th request
  Then the response should be 429 Too Many Requests
  And the Retry-After header should be present

Scenario: Password reset rejected for unverified accounts
  Given a user registered but did not verify their email
  And a password reset token was generated for their account
  When I submit a valid reset token with a new password
  Then the response should be 400 with an error about email verification

Scenario: Failed reset attempts are audited
  Given I submit an invalid reset token
  Then the audit log should contain an entry for the failed attempt
  And the entry should include the requesting IP address

Scenario: Repeated failures invalidate all reset tokens
  Given I submit 3 invalid reset tokens for the same account
  When the legitimate user tries to use their valid token
  Then the token should be invalidated
  And the user must request a new reset email
```
