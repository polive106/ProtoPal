# E2-US30: Audit Log PII Redaction

**User Story**: As a platform operator, I want email addresses and other personally identifiable information to be redacted in audit logs so that log aggregation and third-party log shipping comply with data protection regulations (GDPR, CCPA).

**Acceptance Criteria**:
- [ ] Audit log metadata redacts email addresses to a masked format (e.g., `a***@example.com`)
- [ ] The `AuditLogService.sanitize()` method strips or masks `email` fields in addition to existing `password`/`token`/`secret` sanitization
- [ ] Audit logs retain `userId` for traceability (email can be looked up from the users table when needed)
- [ ] IP addresses in audit logs are either hashed or truncated (last octet zeroed) for GDPR compliance
- [ ] Existing audit log entries for login, registration, forgot-password, and admin actions are updated to use the redacted format
- [ ] A utility function for email masking is shared and reusable

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add email masking utility to AuditLogService sanitize method | packages/api/src/services/AuditLogService.ts |
| API | Update all `metadata: { email }` calls to use userId instead where possible | packages/api/src/controllers/auth.controller.ts |
| API | Add IP anonymization option (truncate last octet) | packages/api/src/services/AuditLogService.ts |
| API | Unit tests for PII redaction | packages/api/src/services/AuditLogService.test.ts |
| Domain | Add email masking utility function | packages/domain/src/utils/mask-email.ts |
| Domain | Unit tests for email masking | packages/domain/src/utils/mask-email.test.ts |

**Dependencies**: E2-US07

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Email is masked in audit log metadata
  Given an audit log entry with metadata { email: "user@example.com" }
  When the entry is sanitized
  Then the email should appear as "u***@example.com"

Scenario: Password and token fields remain stripped
  Given an audit log entry with metadata { password: "secret123", token: "abc" }
  When the entry is sanitized
  Then password and token should be "[REDACTED]"

Scenario: UserId is preserved for traceability
  Given an audit log entry with userId and email
  When the entry is sanitized
  Then userId should remain unchanged
  And email should be masked

Scenario: IP addresses are anonymized
  Given an audit log entry with IP "192.168.1.42"
  When the entry is sanitized
  Then the IP should appear as "192.168.1.0" or a hashed value
```
