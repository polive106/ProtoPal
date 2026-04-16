# E2-US23: Protected Endpoint Rate Limiting

**User Story**: As a platform operator, I want authenticated endpoints (`/auth/me`, `/notes/*`) to have rate limiting so that compromised tokens or abusive clients cannot overwhelm the system or scrape data at scale.

**Acceptance Criteria**:
- [ ] `GET /auth/me` is rate-limited (e.g., 30 requests per minute per user)
- [ ] `GET /notes` is rate-limited (e.g., 60 requests per minute per user)
- [ ] `POST /notes` is rate-limited (e.g., 20 requests per minute per user)
- [ ] `PATCH /notes/:id` is rate-limited (e.g., 20 requests per minute per user)
- [ ] `DELETE /notes/:id` is rate-limited (e.g., 20 requests per minute per user)
- [ ] `GET /notes/:id` is rate-limited (e.g., 60 requests per minute per user)
- [ ] Rate limit keys for authenticated endpoints use the user ID (not just IP), so rate limits are per-user
- [ ] Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) are returned on all rate-limited endpoints
- [ ] Rate limiting configuration is reasonable for normal usage patterns (not too restrictive for legitimate users)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `@RateLimit` to `GET /auth/me` with per-user key | packages/api/src/controllers/auth.controller.ts |
| API | Add `@RateLimit` to all `NotesController` endpoints with per-user key | packages/api/src/controllers/notes.controller.ts |
| API | Extend `RateLimitOptions` to support `keyFromUser` (use `req.user.sub`) | packages/api/src/common/guards/rate-limit.guard.ts |
| API | Unit tests for per-user rate limiting | packages/api/src/common/guards/rate-limit.guard.test.ts |
| API | Integration tests for rate limit on notes endpoints | packages/api/src/controllers/notes.controller.test.ts |
| E2E | Test rate limit headers on authenticated endpoints | e2e/tests/notes.api.spec.ts |

**Dependencies**: E2-US05

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: GET /auth/me is rate limited per user
  Given I am authenticated
  When I call GET /auth/me 31 times in 1 minute
  Then the 31st request should return 429 Too Many Requests
  And rate limit headers should be present on all responses

Scenario: POST /notes is rate limited per user
  Given I am authenticated
  When I create 21 notes in 1 minute
  Then the 21st request should return 429 Too Many Requests

Scenario: Different users have independent rate limits
  Given user A and user B are both authenticated
  When user A calls GET /notes 60 times in 1 minute
  Then user B should still be able to call GET /notes successfully

Scenario: Rate limit headers are present on notes endpoints
  Given I am authenticated
  When I call GET /notes
  Then the response should include X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset headers
```
