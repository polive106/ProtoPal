# E2-US33: Rate Limit Coverage Gaps & Per-Account Limiting

**User Story**: As a platform operator, I want all authentication endpoints to have rate limiting and login rate limits to combine IP and account identity so that distributed credential-stuffing attacks against a single account are throttled and unprotected endpoints cannot be used for resource exhaustion.

**Acceptance Criteria**:
- [ ] `POST /auth/verify` has a rate limit (e.g., 10 requests per 15 minutes per IP)
- [ ] Login rate limit key combines both IP address and email (`keyPrefix:ip:email`) instead of IP alone
- [ ] A separate per-email rate limit exists for login (e.g., 15 attempts per 15 minutes regardless of IP)
- [ ] `keyFromBody` option in `RateLimitGuard` composes with IP rather than replacing it
- [ ] Rate limit response headers are present on all newly rate-limited endpoints
- [ ] Existing account lockout mechanism continues to work alongside the per-email rate limit

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `@RateLimit` decorator to `POST /auth/verify` endpoint | packages/api/src/controllers/auth.controller.ts |
| API | Refactor `RateLimitGuard` to support composite keys (IP + body field) | packages/api/src/common/guards/rate-limit.guard.ts |
| API | Update login rate limit to use composite IP+email key | packages/api/src/controllers/auth.controller.ts |
| API | Add separate per-email rate limit decorator for login | packages/api/src/controllers/auth.controller.ts |
| API | Unit tests for composite key rate limiting | packages/api/src/common/guards/rate-limit.guard.test.ts |
| E2E | Test rate limiting on verify endpoint | e2e/tests/auth.api.spec.ts |

**Dependencies**: E2-US05

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Verify endpoint is rate limited
  Given I submit 11 verification requests in 15 minutes
  When I submit the 11th request
  Then the response should be 429 Too Many Requests

Scenario: Login rate limit uses composite IP+email key
  Given I fail 5 login attempts for user@example.com from IP 1.2.3.4
  When I try to login as user@example.com from IP 5.6.7.8
  And the per-email limit has not been reached
  Then the request should be allowed (different composite key)

Scenario: Per-email login rate limit stops distributed attacks
  Given I fail 15 login attempts for user@example.com from 15 different IPs
  When I try again from a 16th IP
  Then the response should be 429 Too Many Requests (per-email limit exceeded)

Scenario: Account lockout still works alongside rate limits
  Given I fail 5 login attempts for user@example.com
  Then the account should be locked
  And subsequent attempts should return account locked error
```
