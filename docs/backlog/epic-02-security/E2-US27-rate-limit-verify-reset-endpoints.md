# E2-US27: Rate Limit Verify & Reset Password Endpoints

**User Story**: As a platform operator, I want the `/auth/verify` and `/auth/reset-password` endpoints to be rate-limited so that attackers cannot brute-force verification tokens or password-reset tokens at unlimited speed.

**Acceptance Criteria**:
- [ ] `POST /auth/verify` has a `@RateLimit` decorator (10 requests per 15 minutes per IP)
- [ ] `POST /auth/reset-password` has a `@RateLimit` decorator (10 requests per 15 minutes per IP)
- [ ] Rate limit responses include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers
- [ ] Rate limit is enforced per-IP (not per-user, since these are unauthenticated)
- [ ] Existing rate limits on `/auth/login`, `/auth/register`, `/auth/forgot-password`, and `/auth/resend-verification` remain unchanged
- [ ] E2E tests verify rate limiting behavior on both endpoints

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `@RateLimit({ windowMs: 15 * 60 * 1000, max: 10, keyPrefix: 'verify' })` to verify endpoint | packages/api/src/controllers/auth.controller.ts |
| API | Add `@RateLimit({ windowMs: 15 * 60 * 1000, max: 10, keyPrefix: 'reset-password' })` to reset-password endpoint | packages/api/src/controllers/auth.controller.ts |
| API | Unit tests verifying rate limit decorators are applied | packages/api/src/controllers/auth.controller.test.ts |
| E2E | Add rate limit E2E tests for verify and reset-password endpoints | e2e/tests/rate-limit.api.spec.ts |

**Dependencies**: E2-US05

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Verify endpoint is rate limited
  When I call POST /auth/verify 11 times in 15 minutes
  Then the 11th request should return 429 Too Many Requests
  And the response should include X-RateLimit-Limit header

Scenario: Reset-password endpoint is rate limited
  When I call POST /auth/reset-password 11 times in 15 minutes
  Then the 11th request should return 429 Too Many Requests
  And the response should include X-RateLimit-Remaining: 0

Scenario: Rate limits are independent per endpoint
  When I exhaust the rate limit on /auth/verify
  Then requests to /auth/reset-password should still succeed
```
