# E7-US01: Rate Limit Token Verification Endpoints

**User Story**: As a platform operator, I want all token verification endpoints to be rate-limited so that attackers cannot brute-force email verification or password reset tokens.

**Acceptance Criteria**:
- [ ] `POST /auth/verify` is rate-limited (5 requests per minute per IP)
- [ ] `POST /auth/reset-password` is rate-limited (5 requests per minute per IP)
- [ ] Rate limit responses include `Retry-After` header
- [ ] Existing rate-limit guard and decorator pattern is reused
- [ ] Unit tests cover rate-limit enforcement on both endpoints
- [ ] E2E test confirms brute-force attempts are blocked

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `@RateLimit` decorator to `verify` endpoint (5/min) | packages/api/src/controllers/auth.controller.ts |
| API | Add `@RateLimit` decorator to `resetPassword` endpoint (5/min) | packages/api/src/controllers/auth.controller.ts |
| API | Unit tests for rate limiting on verify and reset-password | packages/api/src/controllers/auth.controller.test.ts |
| E2E | Token brute-force rate-limit test | e2e/tests/rate-limit.api.spec.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Verify endpoint blocks excessive attempts
  Given I send 5 POST /auth/verify requests within 1 minute
  When I send a 6th request
  Then I should receive a 429 Too Many Requests with Retry-After header

Scenario: Reset-password endpoint blocks excessive attempts
  Given I send 5 POST /auth/reset-password requests within 1 minute
  When I send a 6th request
  Then I should receive a 429 Too Many Requests with Retry-After header
```
