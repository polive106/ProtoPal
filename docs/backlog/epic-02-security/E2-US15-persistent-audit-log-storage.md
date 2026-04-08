# E2-US15: Persistent Audit Log Storage & Data Access Logging

**User Story**: As a platform operator, I want audit logs persisted to the database and extended to cover data access events so that I have a tamper-resistant, queryable record of all security-relevant actions for compliance and incident response.

**Acceptance Criteria**:
- [ ] New `audit_logs` database table stores all audit events with timestamp, action, userId, ip, outcome, and metadata
- [ ] `AuditLogService` writes to database instead of (or in addition to) console in production
- [ ] All existing auth events (LOGIN, LOGOUT, REGISTER, PASSWORD_RESET, etc.) are persisted
- [ ] New data access events added: NOTE_CREATED, NOTE_UPDATED, NOTE_DELETED, NOTE_ACCESSED
- [ ] Admin role check events (ROLE_BYPASS_ADMIN) are persisted
- [ ] Audit log entries are append-only (no UPDATE or DELETE on the table)
- [ ] Audit log table has indexes on `userId`, `action`, and `timestamp` for query performance
- [ ] Console logging retained in development mode for developer experience
- [ ] Old audit entries can be archived/purged via a configurable retention policy (e.g., 90 days)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Create `audit_logs` table schema | packages/database/src/schema.sqlite.ts, schema.postgres.ts |
| Database | Create `DrizzleAuditLogRepository` adapter | packages/database/src/adapters/DrizzleAuditLogRepository.ts |
| Database | Add migration for new table | packages/database/migrations/ |
| Database | Update seed script with audit_logs table | packages/database/src/seed.ts |
| Domain | Create `AuditLogRepository` port interface | packages/domain/src/ports/AuditLogRepository.ts |
| Domain | Add data access audit actions to AuditAction enum | packages/domain/src/ports/ |
| API | Refactor `AuditLogService` to use repository port (database) | packages/api/src/services/AuditLogService.ts |
| API | Add audit logging to `NotesController` for CRUD operations | packages/api/src/controllers/notes.controller.ts |
| API | Register audit log repository in DI module | packages/api/src/modules/ |
| API | Add cleanup/retention service for old audit entries | packages/api/src/services/AuditLogCleanupService.ts |
| Tests | Unit tests for DrizzleAuditLogRepository | packages/database/src/adapters/DrizzleAuditLogRepository.test.ts |
| Tests | Unit tests for updated AuditLogService | packages/api/src/services/AuditLogService.test.ts |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Login event is persisted to database
  Given the audit log table exists
  When a user logs in successfully
  Then an audit log entry with action "LOGIN" should be stored
  And it should contain the userId, IP address, and timestamp

Scenario: Note creation is audit-logged
  Given a user is authenticated
  When they create a new note
  Then an audit log entry with action "NOTE_CREATED" should be stored
  And the metadata should contain the note ID

Scenario: Note deletion is audit-logged
  Given a user has an existing note
  When they delete the note
  Then an audit log entry with action "NOTE_DELETED" should be stored

Scenario: Audit log entries are append-only
  Given audit log entries exist in the database
  When an attempt is made to update or delete an entry
  Then the operation should be rejected or not available via the repository interface

Scenario: Audit log retention cleanup
  Given audit log entries older than 90 days exist
  When the cleanup service runs
  Then entries older than the retention period should be removed
  And recent entries should remain
```
