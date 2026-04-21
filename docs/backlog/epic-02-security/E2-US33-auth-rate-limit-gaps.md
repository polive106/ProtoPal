# E2-US33: Auth Endpoint Rate Limit & Access Gaps

**User Story**: As a platform operator, I want all sensitive authentication endpoints to have rate limiting and proper access controls so that brute-force attacks on password reset tokens, email verification tokens, and logout cannot succeed.

**Acceptance Criteria**:
- [ ] `POST /auth/reset-password` is rate-limited (5 requests per hour per IP) to prevent reset token brute-forcing
- [ ] `POST /auth/verify` is rate-limited (10 requests per hour per IP) to prevent verification token brute-forcing
- [ ] `POST /auth/logout` is rate-limited (10 requests per minute per IP) to prevent DoS on logout
- [ ] `POST /auth/logout` requires authentication (remove `@Public()` decorator) — unauthenticated logout requests return 401
- [ ] Logout still clears the auth cookie even if the token blacklist operation fails, but logs the failure for audit
- [ ] Rate limit responses include `Retry-After` header for client-side backoff
- [ ] All new rate limits are covered by E2E tests

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `@RateLimit` decorator to `POST /auth/reset-password` (5/hour) | packages/api/src/controllers/auth.controller.ts |
| API | Add `@RateLimit` decorator to `POST /auth/verify` (10/hour) | packages/api/src/controllers/auth.controller.ts |
| API | Add `@RateLimit` decorator to `POST /auth/logout` (10/min) | packages/api/src/controllers/auth.controller.ts |
| API | Remove `@Public()` decorator from logout endpoint, require auth | packages/api/src/controllers/auth.controller.ts |
| API | Log failed token blacklist operations during logout | packages/api/src/controllers/auth.controller.ts |
| API | Unit tests for each new rate limit | packages/api/src/controllers/auth.controller.test.ts |
| E2E | Rate limit E2E tests for reset-password, verify, logout | e2e/tests/auth.api.spec.ts |

**Dependencies**: E2-US05

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Reset password endpoint is rate limited
  Given an attacker sends 6 POST /auth/reset-password requests within 1 hour
  Then the 6th request should return 429 Too Many Requests
  And the response should include a Retry-After header

Scenario: Verify endpoint is rate limited
  Given an attacker sends 11 POST /auth/verify requests within 1 hour
  Then the 11th request should return 429 Too Many Requests

Scenario: Logout requires authentication
  Given I am not authenticated
  When I call POST /auth/logout
  Then the response should be 401 Unauthorized

Scenario: Authenticated logout succeeds
  Given I am authenticated
  When I call POST /auth/logout
  Then the response should be 200
  And my auth cookie is cleared

Scenario: Logout is rate limited
  Given I send 11 POST /auth/logout requests within 1 minute
  Then the 11th request should return 429 Too Many Requests
```
