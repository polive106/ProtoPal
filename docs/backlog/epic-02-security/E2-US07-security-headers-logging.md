# E2-US07: Security Headers & Audit Logging

**User Story**: As a platform operator, I want custom security headers and structured audit logs so that the application meets security best practices and incidents are traceable.

**Acceptance Criteria**:
- [ ] Helmet is configured with a custom Content-Security-Policy
- [ ] CSP policy restricts script sources, frame ancestors, and object sources
- [ ] Logging interceptor sanitizes query parameters before logging
- [ ] Security-relevant events are logged in structured JSON format (login, logout, failed login, registration, password reset, role changes)
- [ ] Audit log entries include timestamp, action, user ID, IP address, and outcome
- [ ] Sensitive data (passwords, tokens) is never included in logs
- [ ] Admin role bypass in RolesGuard is logged for audit trail

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Configure Helmet with custom CSP directives | packages/api/src/main.ts |
| API | Sanitize URL query params in logging interceptor | packages/api/src/common/interceptors/logging.interceptor.ts |
| API | Create AuditLogService for structured event logging | packages/api/src/services/AuditLogService.ts |
| API | Add audit logging to auth controller (login, logout, register, failed attempts) | packages/api/src/controllers/auth.controller.ts |
| API | Add audit logging to RolesGuard admin bypass | packages/api/src/common/guards/roles.guard.ts |
| API | Extract admin role constant | packages/api/src/common/guards/roles.guard.ts |
| API | Unit tests for sanitization and audit logging | packages/api/src/common/interceptors/logging.interceptor.test.ts, packages/api/src/services/AuditLogService.test.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: CSP header is present in responses
  Given the server is running
  When I make any request
  Then the response should include a Content-Security-Policy header
  And it should restrict script-src and frame-ancestors

Scenario: Sensitive query params are sanitized in logs
  Given a request with ?token=secret123
  When the logging interceptor logs the request
  Then the logged URL should show ?token=[REDACTED]

Scenario: Login events are audit logged
  Given a user logs in successfully
  Then an audit log entry should be created with action "login", user ID, IP, and "success"

Scenario: Admin bypass is audit logged
  Given an admin user accesses a role-restricted endpoint
  Then an audit log entry should record the admin bypass
```
