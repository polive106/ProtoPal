# E2-US45: Security Configuration Tightening

**User Story**: As a platform operator, I want security-sensitive defaults to be tightened and development footguns removed so that the application's security posture is stronger out of the box and cannot be accidentally weakened.

**Acceptance Criteria**:
- [ ] Password reset token expiry is reduced from 1 hour to 30 minutes (`PASSWORD_RESET_TOKEN_EXPIRY_MS`)
- [ ] Email verification token expiry is reduced from 24 hours to 6 hours (`VERIFICATION_TOKEN_EXPIRY_MS`)
- [ ] The `DISABLE_RATE_LIMIT` environment variable bypass is removed entirely; tests use proper mocking instead
- [ ] `.env.example` JWT_SECRET placeholder is updated to be exactly 32+ characters to avoid copy-paste mistakes
- [ ] `NODE_ENV` validation at startup throws a fatal error (not just a warning) if the value is not one of `development`, `test`, or `production`
- [ ] Cookie `secure` flag defaults to `true` and is only set to `false` when `NODE_ENV === 'development'` (not the inverse check)
- [ ] Login endpoint returns consistent 401 status for both invalid credentials and locked accounts to prevent account state leakage (move Retry-After to a header on the 401 response)
- [ ] Rate limit cleanup uses a simple mutex to prevent concurrent cleanup race conditions

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Reduce `PASSWORD_RESET_TOKEN_EXPIRY_MS` from 3600000 to 1800000 | packages/domain/src/constants.ts |
| Domain | Reduce `VERIFICATION_TOKEN_EXPIRY_MS` from 86400000 to 21600000 | packages/domain/src/constants.ts |
| API | Remove `DISABLE_RATE_LIMIT` env var check from RateLimitGuard | packages/api/src/common/guards/rate-limit.guard.ts |
| API | Update E2E/test setup to mock rate limiting properly instead of using env var | e2e/ |
| API | Update `validateStartupEnv()` to throw if NODE_ENV is not a valid value | packages/api/src/main.ts |
| API | Flip cookie `secure` flag logic: `secure: process.env.NODE_ENV !== 'development'` | packages/api/src/controllers/auth.controller.ts |
| API | Return 401 (not 429) for locked account login attempts with Retry-After header | packages/api/src/controllers/auth.controller.ts |
| API | Add mutex/flag to rate limit cleanup to prevent concurrent execution | packages/api/src/common/guards/rate-limit.guard.ts |
| Config | Update `.env.example` JWT_SECRET to a 32+ character placeholder | .env.example |
| API | Unit tests for updated startup validation | packages/api/src/main.test.ts |
| E2E | Update lockout E2E tests for 401 response (was 429) | e2e/tests/account-lockout.api.spec.ts |

**Dependencies**: E2-US04, E2-US05

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Password reset token expires after 30 minutes
  Given a password reset token was issued 31 minutes ago
  When I call POST /auth/reset-password with the token
  Then the response should be 400 Bad Request (token expired)

Scenario: Verification token expires after 6 hours
  Given a verification token was issued 7 hours ago
  When I call POST /auth/verify with the token
  Then the response should be 400 Bad Request (token expired)

Scenario: Rate limiting cannot be disabled via environment variable
  Given DISABLE_RATE_LIMIT is set to 'true'
  And NODE_ENV is 'test'
  When I exceed the rate limit on a protected endpoint
  Then I should still receive 429 Too Many Requests

Scenario: Startup fails with invalid NODE_ENV
  Given NODE_ENV is set to 'staging'
  When the application starts
  Then it should throw a fatal error about invalid NODE_ENV

Scenario: Locked account login returns 401 with Retry-After
  Given user account is locked
  When I attempt to log in
  Then the response should be 401 Unauthorized
  And the Retry-After header should indicate when to retry
```
