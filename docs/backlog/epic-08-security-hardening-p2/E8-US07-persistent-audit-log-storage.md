# E8-US07: Persistent Audit Log Storage

**User Story**: As a platform operator, I want security audit logs to be persisted to durable storage so that I can perform forensic analysis after security incidents and meet compliance requirements.

**Acceptance Criteria**:
- [ ] Audit log entries are written to a persistent store (database table or append-only file) in addition to or instead of console output
- [ ] Audit log schema captures: timestamp, action, userId, ip, outcome, and sanitized metadata
- [ ] Old audit log entries are automatically cleaned up based on a configurable retention period (e.g., 90 days)
- [ ] Audit logs are append-only — no update or delete operations are exposed via the application
- [ ] Existing audit log actions are preserved: LOGIN, LOGIN_FAILED, REGISTER, LOGOUT, PASSWORD_RESET_*, ACCOUNT_UNLOCKED, ROLE_BYPASS_ADMIN
- [ ] A query interface exists (at minimum, an admin API endpoint or database view) for reviewing logs

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add `audit_logs` table schema (id, timestamp, action, user_id, ip, outcome, metadata) | packages/database/src/schema.sqlite.ts |
| Database | Create DrizzleAuditLogRepository adapter | packages/database/src/adapters/DrizzleAuditLogRepository.ts |
| Domain | Define AuditLogRepository port | packages/domain/src/ports/AuditLogRepository.ts |
| API | Update AuditLogService to write to repository instead of/alongside console | packages/api/src/services/AuditLogService.ts |
| API | Add audit log cleanup job (similar to TokenCleanupService) | packages/api/src/services/AuditLogCleanupService.ts |
| API | (Optional) Add admin endpoint for querying audit logs | packages/api/src/controllers/admin.controller.ts |
| Database | Update seed script with sample audit log entries | packages/database/src/seed.ts |
| API | Unit tests for persistent audit logging | packages/api/src/services/AuditLogService.test.ts |

**Dependencies**: E2-US07 (Security Headers & Audit Logging — extends existing AuditLogService)

**Complexity**: M

**Status**: Pending

**Security Context**:
- **Severity**: Medium
- **File**: `packages/api/src/services/AuditLogService.ts` (Line 45)
- **Issue**: The current audit logging implementation writes exclusively to console via `console.log(JSON.stringify(logEntry))`. This means:
  1. **No persistence**: If the process restarts or console output is not captured, audit logs are permanently lost.
  2. **No forensics**: After a security incident, there is no way to reconstruct the timeline of events.
  3. **No compliance**: Most security frameworks (SOC 2, ISO 27001, GDPR) require durable, tamper-resistant audit trails.
  4. **No querying**: Operators cannot search for suspicious patterns (e.g., "show all LOGIN_FAILED events from IP X in the last 24 hours").

**Test Scenarios**:
```gherkin
Scenario: Audit log entry is persisted to database
  Given a user attempts to log in
  When the login succeeds
  Then an audit log entry with action "LOGIN" should exist in the database

Scenario: Audit log entries are append-only
  Given an audit log entry exists in the database
  When an attempt is made to update or delete it via the application
  Then the operation should be rejected

Scenario: Old audit log entries are cleaned up
  Given audit log entries older than the retention period exist
  When the cleanup job runs
  Then entries older than the retention period should be removed
  And recent entries should be preserved

Scenario: Sensitive data is not stored in audit logs
  Given a login event with a password in the request
  When the audit log entry is created
  Then the password should not appear in the metadata
```
