# E2-US27: CRUD Endpoint Rate Limiting

**User Story**: As a system operator, I want rate limiting on all CRUD endpoints so that authenticated attackers cannot abuse the API through mass creation, rapid scraping, or denial-of-service via resource exhaustion.

**Acceptance Criteria**:
- [ ] Notes `POST /notes` is rate-limited (e.g., 30 requests per minute per user)
- [ ] Notes `PATCH /notes/:id` is rate-limited (e.g., 60 requests per minute per user)
- [ ] Notes `DELETE /notes/:id` is rate-limited (e.g., 30 requests per minute per user)
- [ ] Notes `GET /notes` list endpoint is rate-limited (e.g., 60 requests per minute per user)
- [ ] Rate limit keys are scoped per authenticated user (not just IP) to prevent shared-IP issues
- [ ] Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) are returned
- [ ] Exceeding limits returns `429 Too Many Requests` with `Retry-After` header
- [ ] Rate limits are configurable via environment variables for different deployment contexts
- [ ] Existing auth endpoint rate limits remain unchanged

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Extend `@RateLimit` decorator to support user-scoped keys (from JWT `sub` claim) | `packages/api/src/common/guards/rate-limit.guard.ts` |
| API | Add `@RateLimit` decorators to all `NotesController` endpoints | `packages/api/src/controllers/notes.controller.ts` |
| API | Add rate limit configuration constants for CRUD endpoints | `packages/api/src/common/guards/rate-limit.guard.ts` |
| Test | Unit tests for user-scoped rate limiting | `packages/api/src/common/guards/rate-limit.guard.test.ts` |
| E2E | E2E test verifying 429 response on CRUD rate limit exceeded | `e2e/tests/rate-limit-crud.test.ts` |

**Dependencies**: E2-US05 (Persistent Rate Limiting)

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Notes creation rate limit enforced
  Given I am authenticated as a verified user
  When I send 31 POST requests to /notes within 1 minute
  Then the 31st request returns 429 Too Many Requests
  And the response includes Retry-After header

Scenario: Rate limit is per-user not per-IP
  Given user A and user B share the same IP
  When user A sends 30 POST requests to /notes
  Then user B can still create notes without being rate-limited

Scenario: Rate limit headers are present
  Given I am authenticated as a verified user
  When I send a POST request to /notes
  Then the response includes X-RateLimit-Limit header
  And the response includes X-RateLimit-Remaining header
```
