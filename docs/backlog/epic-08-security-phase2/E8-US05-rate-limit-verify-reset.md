# E8-US05: Rate Limit Verify & Reset Endpoints

**User Story**: As a platform operator, I want the email verification and password reset endpoints to be rate-limited so that they cannot be used for token brute-forcing or denial-of-service attacks.

**Security Finding**: The `POST /auth/verify` and `POST /auth/reset-password` endpoints lack `@RateLimit` decorators, while all other auth endpoints are rate-limited. Although the tokens are cryptographically strong (32 random bytes / 64 hex chars — infeasible to brute-force), rate limiting provides defense-in-depth and prevents:
- Resource exhaustion from repeated hash computations and DB lookups
- Automated scanning for valid tokens
- Timing oracle attacks (rate limiting adds noise)

**Current State**:
- `packages/api/src/controllers/auth.controller.ts`:
  - `POST /auth/register` — rate limited (3/hour, line 71)
  - `POST /auth/login` — rate limited (5/15min, line 189)
  - `POST /auth/resend-verification` — rate limited (3/hour, line 155)
  - `POST /auth/forgot-password` — rate limited (3/hour, line 285)
  - `POST /auth/verify` — **NO rate limit** (line 131)
  - `POST /auth/reset-password` — **NO rate limit** (line 325)

**Acceptance Criteria**:
- [ ] `POST /auth/verify` is rate limited to 10 requests per 15 minutes per IP
- [ ] `POST /auth/reset-password` is rate limited to 5 requests per 15 minutes per IP
- [ ] Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) are returned
- [ ] Existing tests pass with new rate limits
- [ ] Integration test verifies rate limiting on both endpoints

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `@RateLimit` decorator to verify endpoint | packages/api/src/controllers/auth.controller.ts |
| API | Add `@RateLimit` decorator to reset-password endpoint | packages/api/src/controllers/auth.controller.ts |
| API | Integration tests for rate limiting on new endpoints | packages/api/src/controllers/auth.controller.integration.test.ts |

**Dependencies**: None

**Complexity**: XS

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Verify endpoint is rate limited
  Given I send 11 requests to POST /auth/verify within 15 minutes
  Then the 11th request should return 429 Too Many Requests

Scenario: Reset-password endpoint is rate limited
  Given I send 6 requests to POST /auth/reset-password within 15 minutes
  Then the 6th request should return 429 Too Many Requests
```
