# E2-US39: Defense-in-Depth Repository Access Scoping

**User Story**: As a developer, I want NoteRepository `update` and `delete` methods to include a `userId` filter in their database queries, and note ID path parameters to be validated as UUIDs, so that even if a domain use-case ownership check is bypassed in future code, the database layer enforces tenant isolation.

**Acceptance Criteria**:
- [ ] `NoteRepository.update(id, data)` signature changes to `update(id, userId, data)` with `AND userId = ?` in the WHERE clause
- [ ] `NoteRepository.delete(id)` signature changes to `delete(id, userId)` with `AND userId = ?` in the WHERE clause
- [ ] Both Drizzle and Mongo adapter implementations include the userId filter
- [ ] The `:id` path parameter in notes endpoints is validated as a UUID format (reject malformed IDs early with 400)
- [ ] Domain use cases updated to pass userId through to repository update/delete calls
- [ ] All existing tests updated to pass userId to update/delete
- [ ] No regression in CRUD behavior

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Update `NoteRepository` port: add `userId` param to `update` and `delete` | packages/domain/src/ports/NoteRepository.ts |
| Domain | Update `UpdateNote` and `DeleteNote` use cases to pass `userId` to repository | packages/domain/src/use-cases/UpdateNote.ts, DeleteNote.ts |
| Database | Update `DrizzleNoteRepository.update` and `delete` to include `AND userId = ?` | packages/database/src/adapters/drizzle/DrizzleNoteRepository.ts |
| Database | Update `MongoNoteRepository.update` and `delete` to include `userId` filter | packages/database/src/adapters/mongo/MongoNoteRepository.ts |
| API | Add UUID validation pipe or Zod guard for `:id` path parameter in notes controller | packages/api/src/controllers/notes.controller.ts |
| Domain | Update unit tests for use cases with new signatures | packages/domain/src/use-cases/UpdateNote.test.ts, DeleteNote.test.ts |
| Database | Update adapter tests | packages/database/src/adapters/ |
| API | Update controller tests | packages/api/src/controllers/notes.controller.test.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Update query includes userId filter
  Given user-A owns note-1
  When the repository update is called with (note-1, user-B, {title: "hacked"})
  Then the update should affect 0 rows (userId mismatch)

Scenario: Delete query includes userId filter
  Given user-A owns note-1
  When the repository delete is called with (note-1, user-B)
  Then the delete should affect 0 rows

Scenario: Invalid note ID format is rejected
  When I call GET /notes/not-a-uuid
  Then the response should be 400 Bad Request

Scenario: Valid UUID note ID is accepted
  When I call GET /notes/550e8400-e29b-41d4-a716-446655440000
  Then the request should proceed to the use case layer
```
