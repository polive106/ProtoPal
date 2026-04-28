# E2-US38: Notes API Pagination & Bounded Queries

**User Story**: As a platform operator, I want the notes listing endpoint to support pagination with enforced maximum page sizes so that a user with thousands of notes (or an attacker creating many notes) cannot cause unbounded memory consumption or excessive response times.

**Acceptance Criteria**:
- [ ] `GET /notes` accepts optional `limit` and `offset` query parameters
- [ ] Default page size is 50, maximum page size is 100
- [ ] Requests with `limit` > 100 are clamped to 100 (or rejected with 400)
- [ ] Response includes pagination metadata: `total`, `limit`, `offset`, `hasMore`
- [ ] `ListNotes` use case and `NoteRepository.findByUserId` port accept pagination parameters
- [ ] Database adapters (Drizzle + Mongo) implement paginated queries with `LIMIT`/`OFFSET`
- [ ] Query parameters are validated with Zod (must be positive integers)
- [ ] Existing frontend/mobile consumers are updated to use pagination (or default behavior is backward-compatible)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Add `PaginationParams` type (limit, offset) and `PaginatedResult<T>` type | packages/domain/src/ports/NoteRepository.ts |
| Domain | Update `ListNotes` use case to accept and pass pagination params | packages/domain/src/use-cases/ListNotes.ts |
| Database | Update `DrizzleNoteRepository.findByUserId` to support limit/offset | packages/database/src/adapters/drizzle/DrizzleNoteRepository.ts |
| Database | Update `MongoNoteRepository.findByUserId` to support limit/offset | packages/database/src/adapters/mongo/MongoNoteRepository.ts |
| API | Add query parameter validation DTO for pagination | packages/api/src/controllers/dto/notes.dto.ts |
| API | Update `NotesController.findAll()` to parse and pass pagination params | packages/api/src/controllers/notes.controller.ts |
| Domain | Unit tests for paginated ListNotes | packages/domain/src/use-cases/ListNotes.test.ts |
| API | Unit tests for pagination query validation | packages/api/src/controllers/notes.controller.test.ts |
| E2E | Test pagination behavior (default, explicit, max clamping) | e2e/tests/notes.api.spec.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Default pagination returns first 50 notes
  Given I have 75 notes
  When I call GET /notes without pagination params
  Then I should receive 50 notes
  And hasMore should be true
  And total should be 75

Scenario: Custom page size is respected
  Given I have 30 notes
  When I call GET /notes?limit=10&offset=0
  Then I should receive 10 notes
  And hasMore should be true

Scenario: Maximum page size is enforced
  Given I have 200 notes
  When I call GET /notes?limit=500
  Then I should receive at most 100 notes

Scenario: Invalid pagination params are rejected
  When I call GET /notes?limit=-1
  Then the response should be 400 Bad Request

Scenario: Offset beyond total returns empty list
  Given I have 10 notes
  When I call GET /notes?offset=100
  Then I should receive 0 notes
  And hasMore should be false
```
