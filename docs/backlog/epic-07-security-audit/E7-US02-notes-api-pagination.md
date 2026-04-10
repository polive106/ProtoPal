# E7-US02: Notes API Pagination & Query Limits

**User Story**: As a platform operator, I want the notes list endpoint to support pagination with enforced limits so that a user with many notes cannot cause memory exhaustion or denial-of-service.

**Acceptance Criteria**:
- [ ] `GET /notes` accepts optional `limit` and `offset` query parameters
- [ ] Default limit is 20, maximum limit is 100
- [ ] Requests exceeding the maximum limit are clamped to 100
- [ ] Response includes `total` count for client-side pagination
- [ ] Domain use-case and repository port accept pagination parameters
- [ ] Frontend and mobile clients updated to handle paginated responses
- [ ] Unit tests cover default, custom, and clamped pagination
- [ ] E2E test confirms pagination works end-to-end

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Add `PaginationParams` type and update `ListNotes` use-case | packages/domain/src/use-cases/ListNotes.ts |
| Domain | Update `NoteRepository` port with pagination signature | packages/domain/src/ports/NoteRepository.ts |
| Database | Update `DrizzleNoteRepository.findByUserId` to support limit/offset | packages/database/src/adapters/DrizzleNoteRepository.ts |
| API | Add `limit`/`offset` query params to notes list endpoint with validation | packages/api/src/controllers/notes.controller.ts |
| API | Add pagination query DTO with Zod validation | packages/api/src/controllers/dto/notes.dto.ts |
| Frontend | Update notes API and hooks to pass pagination params | packages/frontend/src/features/notes/api.ts, packages/frontend/src/features/notes/hooks/ |
| Mobile | Update notes API and hooks to pass pagination params | packages/mobile/src/features/notes/api.ts, packages/mobile/src/features/notes/hooks/ |
| API | Unit tests for pagination defaults and clamping | packages/api/src/controllers/notes.controller.test.ts |
| E2E | Pagination E2E test | e2e/tests/notes.api.spec.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Default pagination returns first 20 notes
  Given I have 50 notes
  When I call GET /notes without pagination params
  Then I should receive 20 notes and total=50

Scenario: Custom limit is respected
  Given I have 50 notes
  When I call GET /notes?limit=10&offset=5
  Then I should receive 10 notes starting from offset 5

Scenario: Limit exceeding maximum is clamped
  Given I have 200 notes
  When I call GET /notes?limit=500
  Then I should receive 100 notes (clamped to max)
```
