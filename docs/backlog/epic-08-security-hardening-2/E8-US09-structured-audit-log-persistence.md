# E8-US09: Structured Audit Log Persistence

**User Story**: As a platform operator, I want audit logs persisted to a durable store with structured format so that security events are retained for compliance, incident investigation, and monitoring.

**Acceptance Criteria**:
- [ ] Audit log entries are written to a database table (in addition to or instead of console)
- [ ] Each log entry includes: timestamp, action, userId, IP, outcome, and sanitized metadata
- [ ] Audit logs are queryable by action, userId, IP, outcome, and date range
- [ ] Sensitive fields (password, token, secret) remain filtered from stored logs
- [ ] A retention policy exists (configurable, default 90 days)
- [ ] Old audit log entries are cleaned up automatically
- [ ] Admin endpoint to query audit logs (with pagination)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add `audit_logs` table to SQLite and PostgreSQL schemas | packages/database/src/schema/schema.sqlite.ts, schema.postgres.ts |
| Database | AuditLogRepository adapter (Drizzle) | packages/database/src/adapters/drizzle/DrizzleAuditLogRepository.ts |
| Domain | AuditLogRepository port with query interface | packages/domain/src/ports/AuditLogRepository.ts |
| Domain | AuditLog entity | packages/domain/src/entities/AuditLog.ts |
| API | Update AuditLogService to write to database | packages/api/src/services/AuditLogService.ts |
| API | Add audit log cleanup to TokenCleanupService | packages/api/src/services/TokenCleanupService.ts |
| API | Add `GET /admin/audit-logs` endpoint with filtering and pagination | packages/api/src/controllers/admin.controller.ts |
| API | Add `AUDIT_LOG_RETENTION_DAYS` env var (default 90) | .env.example |
| API | Unit tests for audit log persistence and querying | packages/api/src/services/AuditLogService.test.ts |
| API | Integration tests for admin audit log endpoint | packages/api/src/controllers/admin.controller.integration.test.ts |
| E2E | Verify audit log entries created for auth events | e2e/tests/auth.api.spec.ts |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Login events are persisted to audit log table
  Given a user logs in successfully
  Then an audit log entry with action "LOGIN" should exist in the database
  And it should include the user ID, IP address, and "success" outcome

Scenario: Failed login events are persisted
  Given a login attempt fails with wrong password
  Then an audit log entry with action "LOGIN_FAILED" should exist
  And the metadata should include the email but not the password

Scenario: Admin can query audit logs
  Given several audit events have been logged
  When an admin calls GET /admin/audit-logs?action=LOGIN&limit=10
  Then the response should contain matching audit log entries with pagination

Scenario: Old audit logs are cleaned up
  Given audit log entries older than the retention period exist
  When the cleanup job runs
  Then entries older than AUDIT_LOG_RETENTION_DAYS should be deleted

Scenario: Sensitive data is not stored in audit logs
  Given a login event is logged
  Then the stored metadata should NOT contain password, token, or secret fields
```
