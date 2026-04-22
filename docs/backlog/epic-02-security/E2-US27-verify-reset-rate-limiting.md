# E2-US27: Verify & Reset-Password Endpoint Rate Limiting

**User Story**: As a platform operator, I want the email verification and password reset endpoints to be rate-limited so that attackers cannot brute-force verification or reset tokens.

**Acceptance Criteria**:
- [ ] `POST /auth/verify` has rate limiting applied (e.g., 10 requests per 15 minutes per IP)
- [ ] `POST /auth/reset-password` has rate limiting applied (e.g., 5 requests per 15 minutes per IP)
- [ ] Rate limit response headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset) are present on both endpoints
- [ ] Brute-force attempts return 429 Too Many Requests after limit exceeded
- [ ] Existing E2E tests for verify and reset-password still pass
- [ ] New tests cover the rate-limiting behavior

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `@RateLimit()` decorator to `verify` endpoint | packages/api/src/controllers/auth.controller.ts |
| API | Add `@RateLimit()` decorator to `resetPassword` endpoint | packages/api/src/controllers/auth.controller.ts |
| API | Unit tests for rate limiting on both endpoints | packages/api/src/controllers/auth.controller.integration.test.ts |
| E2E | E2E test verifying 429 response after limit exceeded | e2e/tests/auth.api.spec.ts |

**Dependencies**: E2-US05 (Persistent Rate Limiting — Done)

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Verify endpoint rate-limited after threshold
  Given I have exceeded the verify endpoint rate limit
  When I send another POST /auth/verify request
  Then the response should be 429 Too Many Requests
  And X-RateLimit-Remaining header should be 0

Scenario: Reset-password endpoint rate-limited after threshold
  Given I have exceeded the reset-password endpoint rate limit
  When I send another POST /auth/reset-password request
  Then the response should be 429 Too Many Requests

Scenario: Rate limit resets after window expires
  Given the rate limit window for /auth/verify has expired
  When I send a POST /auth/verify request
  Then the response should not be 429
```
