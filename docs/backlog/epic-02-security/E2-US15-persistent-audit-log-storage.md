# E2-US15: Persistent Audit Log Storage

**User Story**: As a platform operator, I want audit logs persisted to the database with retention policies so that security events can be queried during incident response, survive process restarts, and satisfy compliance requirements.

**Acceptance Criteria**:
- [ ] An `audit_logs` table exists with columns: id, action, user_id, ip, outcome, metadata (JSON), created_at
- [ ] `AuditLogService.log()` writes to the database instead of (or in addition to) `console.log`
- [ ] Audit log writes are fire-and-forget (do not block the request/response cycle)
- [ ] Audit log writes that fail do not crash the application (graceful degradation)
- [ ] An admin-only `GET /admin/audit-logs` endpoint exists with pagination and filtering (by action, userId, date range)
- [ ] A cleanup job removes audit logs older than a configurable retention period (default: 90 days)
- [ ] Console logging of audit events remains available in development for convenience
- [ ] Existing audit log entries (auth events) continue to be recorded

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add `audit_logs` table (id, action, user_id, ip, outcome, metadata, created_at) | packages/database/src/schema.sqlite.ts |
| Database | Add `AuditLogRepository` adapter with insert, query, and cleanup methods | packages/database/src/adapters/DrizzleAuditLogRepository.ts |
| Domain | Add `AuditLogRepository` port interface | packages/domain/src/ports/AuditLogRepository.ts |
| API | Refactor `AuditLogService` to write to database (async, non-blocking) | packages/api/src/services/AuditLogService.ts |
| API | Add `GET /admin/audit-logs` endpoint with pagination and filters | packages/api/src/controllers/admin.controller.ts |
| API | Add audit log cleanup to existing token cleanup job or create dedicated job | packages/api/src/services/AuditLogCleanupService.ts |
| API | Unit tests for AuditLogService database writes | packages/api/src/services/AuditLogService.test.ts |
| API | Integration tests for audit-logs query endpoint | packages/api/src/controllers/admin.controller.integration.test.ts |
| E2E | Verify audit logs are queryable after login events | e2e/tests/auth.api.spec.ts |

**Dependencies**: E2-US07

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Auth events are persisted to database
  Given a user logs in successfully
  When I query the audit_logs table
  Then a LOGIN entry exists with the user's ID and IP

Scenario: Audit log failure does not crash the request
  Given the audit_logs table is temporarily unavailable
  When a user logs in
  Then the login should still succeed
  And an error should be logged to console

Scenario: Admin can query audit logs with filters
  Given several audit log entries exist
  When an admin calls GET /admin/audit-logs?action=LOGIN&userId=user-1
  Then only matching entries are returned with pagination metadata

Scenario: Old audit logs are cleaned up
  Given audit log entries older than 90 days exist
  When the cleanup job runs
  Then entries older than 90 days should be removed
  And recent entries should remain
```
