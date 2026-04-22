# E2-US29: Notes API Pagination & Write Rate Limiting

**User Story**: As a platform operator, I want the notes API to support pagination and have write rate limiting so that a user with many notes cannot trigger unbounded database queries, and automated scripts cannot spam-create notes.

**Acceptance Criteria**:
- [ ] `GET /notes` accepts optional `limit` and `offset` (or `page`/`pageSize`) query parameters
- [ ] Default page size is 50; maximum page size is 100
- [ ] Response includes pagination metadata (total count, current page, has more)
- [ ] `POST /notes` has rate limiting (e.g., 30 creates per hour per user)
- [ ] `PATCH /notes/:id` has rate limiting (e.g., 60 updates per hour per user)
- [ ] Domain `ListNotes` use case accepts pagination parameters
- [ ] `NoteRepository` port updated with paginated query method
- [ ] Frontend and mobile note-fetching hooks updated to support paginated responses
- [ ] Existing tests updated to account for pagination

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Add pagination params to `ListNotes.execute()` | packages/domain/src/use-cases/ListNotes.ts |
| Domain | Update `NoteRepository` port with paginated method | packages/domain/src/ports/NoteRepository.ts |
| Database | Implement paginated query in Drizzle adapter | packages/database/src/adapters/drizzle/DrizzleNoteRepository.ts |
| API | Add query param parsing to `GET /notes` controller | packages/api/src/controllers/notes.controller.ts |
| API | Add `@RateLimit()` to `POST /notes` and `PATCH /notes/:id` | packages/api/src/controllers/notes.controller.ts |
| Frontend | Update notes hooks for paginated responses | packages/frontend/src/features/notes/hooks/ |
| Mobile | Update notes hooks for paginated responses | packages/mobile/src/features/notes/hooks/ |
| Domain | Unit tests for paginated ListNotes | packages/domain/src/use-cases/ListNotes.test.ts |
| API | Integration tests for pagination and rate limiting | packages/api/src/controllers/notes.controller.integration.test.ts |
| E2E | E2E test for pagination behavior | e2e/tests/notes.api.spec.ts |

**Dependencies**: E2-US05 (Persistent Rate Limiting — Done)

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Notes list returns paginated results
  Given I have 75 notes
  When I request GET /notes without pagination params
  Then I should receive 50 notes and pagination metadata showing more available

Scenario: Custom page size is respected up to maximum
  Given I have 75 notes
  When I request GET /notes?limit=25
  Then I should receive exactly 25 notes

Scenario: Page size exceeding maximum is capped
  Given I request GET /notes?limit=200
  Then I should receive at most 100 notes

Scenario: Note creation rate limited
  Given I have created 30 notes in the last hour
  When I try to create another note
  Then the response should be 429 Too Many Requests
```
