# E2-US17: API Pagination & Resource Exhaustion Prevention

**User Story**: As a platform operator, I want API list endpoints to support pagination and enforce resource limits so that a single user or request cannot exhaust server memory or degrade performance for other users.

**Acceptance Criteria**:
- [ ] `GET /notes` supports `page` and `limit` query parameters with sensible defaults (page=1, limit=20)
- [ ] Maximum `limit` is capped at 100 to prevent excessive data retrieval
- [ ] Response includes pagination metadata (`total`, `page`, `limit`, `totalPages`)
- [ ] `ListNotes` use-case accepts pagination parameters and passes them to the repository
- [ ] `NoteRepository` port updated with pagination support (`findByUserId(userId, { page, limit })`)
- [ ] Frontend `useNotes` hook supports paginated queries via TanStack Query
- [ ] Mobile app updated to use paginated notes API
- [ ] Database queries use `LIMIT` and `OFFSET` (not in-memory filtering)
- [ ] Empty pages return an empty array with correct metadata (not 404)
- [ ] Existing E2E tests updated for paginated response format

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Add pagination types (`PaginationParams`, `PaginatedResult`) | packages/domain/src/types/ |
| Domain | Update `NoteRepository.findByUserId` port to accept pagination | packages/domain/src/ports/NoteRepository.ts |
| Domain | Update `ListNotes` use-case to accept and forward pagination | packages/domain/src/use-cases/ListNotes.ts |
| Domain | Add unit tests for paginated ListNotes | packages/domain/src/use-cases/ListNotes.test.ts |
| Database | Update `DrizzleNoteRepository.findByUserId` with LIMIT/OFFSET and COUNT | packages/database/src/adapters/DrizzleNoteRepository.ts |
| Database | Add integration tests for paginated queries | packages/database/src/adapters/DrizzleNoteRepository.test.ts |
| API | Add pagination query params to `NotesController.list` | packages/api/src/controllers/notes.controller.ts |
| API | Add pagination DTO with Zod validation | packages/api/src/controllers/dto/notes.dto.ts |
| Frontend | Update notes API client for paginated response | packages/frontend/src/features/notes/api.ts |
| Frontend | Update `useNotes` hook for paginated queries | packages/frontend/src/features/notes/hooks/ |
| Mobile | Update mobile notes API for pagination | packages/mobile/src/features/notes/api.ts |
| E2E | Update notes E2E tests for paginated responses | e2e/tests/notes.api.spec.ts |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Default pagination returns first page
  Given a user has 25 notes
  When I GET /notes without pagination params
  Then the response should contain 20 notes (default limit)
  And pagination metadata should show page 1, total 25, totalPages 2

Scenario: Custom page and limit
  Given a user has 25 notes
  When I GET /notes?page=2&limit=10
  Then the response should contain 10 notes
  And pagination metadata should show page 2, total 25, totalPages 3

Scenario: Limit capped at maximum
  Given a user has 200 notes
  When I GET /notes?limit=500
  Then the response should contain at most 100 notes (max limit enforced)

Scenario: Empty page returns empty array
  Given a user has 5 notes
  When I GET /notes?page=10
  Then the response should contain 0 notes
  And pagination metadata should show total 5
```
