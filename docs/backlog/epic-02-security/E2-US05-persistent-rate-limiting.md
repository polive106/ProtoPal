# E2-US05: Persistent Rate Limiting

**User Story**: As a platform operator, I want rate limiting to persist across server restarts and work across multiple instances so that protection is reliable in production.

**Acceptance Criteria**:
- [x] Rate limit state is stored in the database (or Redis when available)
- [x] Rate limits survive server restarts
- [x] Rate limits work correctly across multiple server instances
- [x] `clearRateLimitStore()` export is removed or gated behind test-only check
- [x] Sliding window algorithm replaces the current fixed window
- [x] Rate limit headers are included in responses (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add `rate_limit_entries` table (key, count, window_start, expires_at) | packages/database/src/schema.sqlite.ts |
| Database | RateLimitRepository adapter | packages/database/src/adapters/DrizzleRateLimitRepository.ts |
| Domain | RateLimitRepository port | packages/domain/src/ports/RateLimitRepository.ts |
| API | Refactor RateLimitGuard to use repository instead of in-memory Map | packages/api/src/common/guards/rate-limit.guard.ts |
| API | Add rate limit response headers | packages/api/src/common/guards/rate-limit.guard.ts |
| API | Remove or gate `clearRateLimitStore()` export | packages/api/src/common/guards/rate-limit.guard.ts |
| API | Unit tests for persistent rate limiting | packages/api/src/common/guards/rate-limit.guard.test.ts |
| E2E | Rate limit persistence test | e2e/tests/auth.api.spec.ts |

**Dependencies**: None

**Complexity**: M

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: Rate limits persist across restarts
  Given I have made 4 of 5 allowed login attempts
  When the server restarts
  And I make another login attempt
  Then I should be rate limited (429)

Scenario: Rate limit headers are present
  Given I make a request to a rate-limited endpoint
  Then the response should include X-RateLimit-Limit
  And the response should include X-RateLimit-Remaining
  And the response should include X-RateLimit-Reset

Scenario: clearRateLimitStore is not accessible in production
  Given NODE_ENV is 'production'
  Then clearRateLimitStore should not be callable
```
