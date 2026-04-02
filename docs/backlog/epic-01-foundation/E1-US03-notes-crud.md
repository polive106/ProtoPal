# E1-US03: Notes CRUD

**User Story**: As a user, I want to create, read, update, and delete notes so that I can manage my information.

**Acceptance Criteria**:
- [x] Users can create notes with title and content
- [x] Users can view a list of their notes
- [x] Users can view a single note
- [x] Users can edit note title and content
- [x] Users can delete a note
- [x] Notes are scoped to the authenticated user
- [x] Users cannot access other users' notes

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Note entity | packages/domain/src/entities/Note.ts |
| Domain | NoteRepository port | packages/domain/src/ports/NoteRepository.ts |
| Domain | CreateNote, ListNotes, UpdateNote, DeleteNote, GetNote use cases + tests | packages/domain/src/use-cases/ |
| Database | Notes table schema | packages/database/src/schema.sqlite.ts |
| Database | DrizzleNoteRepository + tests | packages/database/src/adapters/ |
| API | NotesController (CRUD endpoints) | packages/api/src/controllers/notes.controller.ts |
| Frontend | NoteList, NoteCard, NoteForm components | packages/frontend/src/features/notes/ |
| Frontend | Notes routes | packages/frontend/src/routes/_authenticated/notes/ |
| Frontend | useNotes hooks | packages/frontend/src/features/notes/useNotes.ts |
| E2E | Notes CRUD tests | e2e/tests/notes/crud.spec.ts |

**Dependencies**: E1-US02

**Complexity**: M

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: Create a note
  Given I am logged in
  And I am on the notes page
  When I click "New Note"
  And I fill in title and content
  And I click "Create"
  Then the note should appear in the list

Scenario: Delete a note
  Given I am logged in
  And I have an existing note
  When I click "Delete" on the note
  Then the note should be removed from the list

Scenario: Unauthorized access
  Given I am not logged in
  When I try to access /notes
  Then I should receive a 401 error
```
