# E2-US43: Notes API Pagination & Resource Rate Limiting

**User Story**: As a platform operator, I want the notes listing endpoint to enforce pagination limits and all resource endpoints to have rate limiting so that a single user cannot exhaust server resources via unbounded queries or excessive request volume.

**Acceptance Criteria**:
- [ ] `GET /notes` accepts `limit` and `offset` query parameters
- [ ] Default page size is 50; maximum page size is 100
- [ ] Requests with `limit` > 100 are clamped to 100 (not rejected)
- [ ] Response includes pagination metadata: `total`, `limit`, `offset`, `hasMore`
- [ ] `ListNotes` use case and repository port accept pagination parameters
- [ ] Notes CRUD endpoints are rate-limited: 100 req/min for reads, 30 req/min for writes (create/update/delete)
- [ ] Rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining) are returned on notes endpoints
- [ ] Frontend and mobile clients are updated to use paginated responses
- [ ] Zod schema validates `limit` and `offset` as positive integers

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Shared | Add `PaginationParams` and `PaginatedResponse` Zod schemas | packages/shared/src/schemas/ |
| Domain | Update `NoteRepository` port to accept `limit` and `offset` | packages/domain/src/ports/NoteRepository.ts |
| Domain | Update `ListNotes` use case to pass pagination params and return total count | packages/domain/src/use-cases/ListNotes.ts |
| Database | Update Drizzle and Mongo note repository adapters with LIMIT/OFFSET queries and COUNT | packages/database/src/adapters/ |
| API | Add query param validation and pagination to `GET /notes` | packages/api/src/controllers/notes.controller.ts |
| API | Add `@RateLimit` decorators to all notes endpoints | packages/api/src/controllers/notes.controller.ts |
| Frontend | Update `useNotes` hook to handle paginated responses | packages/frontend/src/features/notes/ |
| Mobile | Update notes list to handle paginated responses | packages/mobile/src/features/notes/ |
| Domain | Unit tests for paginated ListNotes | packages/domain/src/use-cases/ListNotes.test.ts |
| API | Integration tests for pagination and rate limiting | packages/api/src/controllers/notes.controller.test.ts |
| E2E | E2E tests for pagination edge cases | e2e/tests/notes.api.spec.ts |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Default pagination returns first 50 notes
  Given I have 120 notes
  When I call GET /notes without query parameters
  Then I should receive 50 notes
  And the response should include total: 120, hasMore: true

Scenario: Custom pagination is respected
  Given I have 120 notes
  When I call GET /notes?limit=20&offset=40
  Then I should receive 20 notes starting from the 41st
  And the response should include total: 120, offset: 40

Scenario: Maximum page size is enforced
  Given I have 200 notes
  When I call GET /notes?limit=500
  Then I should receive 100 notes (clamped to max)

Scenario: Notes write endpoints are rate limited
  Given I am authenticated
  When I send 31 POST /notes requests within 1 minute
  Then the 31st request should return 429 Too Many Requests

Scenario: Notes read endpoints are rate limited
  Given I am authenticated
  When I send 101 GET /notes requests within 1 minute
  Then the 101st request should return 429 Too Many Requests
```
