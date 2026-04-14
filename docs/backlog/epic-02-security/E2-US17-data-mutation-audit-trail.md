# E2-US17: Data Mutation Audit Trail

**User Story**: As a platform operator, I want all data mutations (create, update, delete) to be logged with the acting user's identity so that I can investigate data integrity issues, unauthorized changes, and satisfy audit compliance requirements.

**Acceptance Criteria**:
- [ ] `AuditAction` enum includes: `NOTE_CREATED`, `NOTE_UPDATED`, `NOTE_DELETED`
- [ ] Notes controller logs create, update, and delete operations via `AuditLogService`
- [ ] Each audit entry includes: user ID, action, resource ID, IP address, and outcome
- [ ] Update operations log which fields changed (without logging the full content for privacy)
- [ ] Delete operations log the resource ID being deleted
- [ ] Audit logging does not block the request/response cycle
- [ ] Audit log failures do not cause CRUD operations to fail

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `NOTE_CREATED`, `NOTE_UPDATED`, `NOTE_DELETED` to `AuditAction` enum | packages/api/src/services/AuditLogService.ts |
| API | Add audit logging to `NotesController.create()` | packages/api/src/controllers/notes.controller.ts |
| API | Add audit logging to `NotesController.update()` | packages/api/src/controllers/notes.controller.ts |
| API | Add audit logging to `NotesController.remove()` | packages/api/src/controllers/notes.controller.ts |
| API | Inject `AuditLogService` and `Request` into `NotesController` | packages/api/src/controllers/notes.controller.ts |
| API | Unit tests verifying audit entries for each CRUD operation | packages/api/src/controllers/notes.controller.test.ts |
| E2E | Verify audit entries created after note operations | e2e/tests/notes.api.spec.ts |

**Dependencies**: E2-US07, E2-US15

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Note creation is audited
  Given I am authenticated
  When I create a new note
  Then an audit log entry with action NOTE_CREATED should exist
  And it should include my user ID and the new note's ID

Scenario: Note update is audited with changed fields
  Given I have an existing note
  When I update the note's title
  Then an audit log entry with action NOTE_UPDATED should exist
  And the metadata should indicate which fields were changed

Scenario: Note deletion is audited
  Given I have an existing note
  When I delete the note
  Then an audit log entry with action NOTE_DELETED should exist
  And it should include the deleted note's ID

Scenario: Audit failure does not block note creation
  Given the audit log system is temporarily unavailable
  When I create a new note
  Then the note should still be created successfully
```
