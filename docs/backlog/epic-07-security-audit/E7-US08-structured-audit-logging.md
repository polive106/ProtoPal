# E7-US08: Structured Audit Logging

**User Story**: As a platform operator, I want audit logs to be structured, configurable, and free of information leakage so that they can be shipped to a log aggregation system and do not aid attackers.

**Acceptance Criteria**:
- [ ] Audit log output uses a structured logger (e.g., Winston or Pino) instead of raw `console.log`
- [ ] Log level is configurable via environment variable (`LOG_LEVEL`)
- [ ] Registration failure audit entries use a generic reason instead of `duplicate_email`
- [ ] Audit log entries include a correlation ID for request tracing
- [ ] Console email service token output is suppressed outside of `NODE_ENV=test`
- [ ] Unit tests verify no enumeration-aiding reasons appear in audit entries

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Replace `console.log` in AuditLogService with structured logger | packages/api/src/services/AuditLogService.ts |
| API | Add logger configuration (level, format) based on `LOG_LEVEL` env | packages/api/src/services/AuditLogService.ts |
| API | Change `reason: 'duplicate_email'` to generic `reason: 'registration_failed'` | packages/api/src/controllers/auth.controller.ts |
| API | Add correlation/request ID to audit log entries | packages/api/src/common/interceptors/logging.interceptor.ts, packages/api/src/services/AuditLogService.ts |
| API | Guard ConsoleEmailService token output behind `NODE_ENV === 'test'` | packages/api/src/services/ConsoleEmailService.ts |
| Config | Add `LOG_LEVEL` to `.env.example` | .env.example |
| API | Unit tests for structured log output and redacted reasons | packages/api/src/services/AuditLogService.test.ts |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Audit log uses structured format
  Given a login event occurs
  When the audit log entry is emitted
  Then it should be valid JSON with timestamp, action, userId, ip, and correlationId fields

Scenario: Registration failure does not reveal duplicate email
  Given a user registers with an existing email
  When the audit log entry is created
  Then the reason field should be "registration_failed" (not "duplicate_email")

Scenario: Email service does not log tokens in development
  Given NODE_ENV=development
  When a verification email is sent
  Then the raw token should not appear in console output
```
