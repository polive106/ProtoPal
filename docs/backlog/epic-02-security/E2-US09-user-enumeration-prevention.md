# E2-US09: User Enumeration Prevention

**User Story**: As a platform operator, I want the application to return generic responses for auth-related operations so that attackers cannot determine which email addresses have registered accounts.

**Acceptance Criteria**:
- [x] `POST /auth/register` returns the same success message and HTTP 201 whether the email is new or already registered
- [x] `POST /auth/resend-verification` returns the same success message whether the email exists or not
- [x] `POST /auth/forgot-password` (when implemented in E2-US06) returns the same message for all emails
- [x] Registration with a duplicate email still silently succeeds from the caller's perspective (no user/token created internally)
- [x] Timing side-channels are mitigated by maintaining consistent response times (hash a dummy password when user doesn't exist)
- [x] Existing E2E tests are updated to account for generic responses
- [x] Error logs still record the actual outcome for debugging (not exposed to client)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | RegisterUser returns generic result when email exists (no error thrown) | packages/domain/src/use-cases/RegisterUser.ts |
| Domain | ResendVerification returns generic result when email not found | packages/domain/src/use-cases/ResendVerification.ts |
| Domain | Add constant-time dummy hash on duplicate email to prevent timing attacks | packages/domain/src/use-cases/RegisterUser.ts |
| API | Auth controller returns uniform 201 for register, 200 for resend regardless of outcome | packages/api/src/controllers/auth.controller.ts |
| API | Log actual outcome (duplicate, not found) at info level server-side | packages/api/src/controllers/auth.controller.ts |
| Domain | Unit tests verifying generic responses for existing/non-existing emails | packages/domain/src/use-cases/RegisterUser.test.ts |
| Domain | Unit tests for ResendVerification generic responses | packages/domain/src/use-cases/ResendVerification.test.ts |
| E2E | Update registration tests to expect generic responses | e2e/tests/auth.api.spec.ts |

**Dependencies**: None

**Complexity**: M

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: Registration with existing email returns success
  Given "user@example.com" is already registered
  When I submit a registration request for "user@example.com"
  Then the response should be 201 Created
  And the response message should be the same generic success message
  And no duplicate user should be created

Scenario: Resend verification for non-existent email returns success
  Given "unknown@example.com" is not registered
  When I request resend verification for "unknown@example.com"
  Then the response should be 200 OK
  And the response message should be the same generic success message

Scenario: Registration timing is consistent
  Given "existing@example.com" is registered and "new@example.com" is not
  When I time registration requests for both emails
  Then the response times should be within 100ms of each other
```
