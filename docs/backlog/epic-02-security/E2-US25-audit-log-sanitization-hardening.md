# E2-US25: Audit Log Sanitization Hardening

**User Story**: As a platform operator, I want audit log metadata sanitization to use an allowlist approach instead of a denylist so that new sensitive fields cannot accidentally be logged and the sanitization is future-proof.

**Acceptance Criteria**:
- [ ] `AuditLogService.sanitize()` switches from a denylist (`SENSITIVE_KEYS`) to an allowlist (`ALLOWED_METADATA_KEYS`)
- [ ] The allowlist explicitly permits safe keys: `email`, `reason`, `action`, `unlockedEmail`, `requiredRoles`, `method`, `path`, `statusCode`, `duration`
- [ ] Any metadata key not in the allowlist is stripped from the log entry
- [ ] Nested objects in metadata are sanitized recursively (or flattened)
- [ ] Existing audit log entries continue to include all currently logged safe fields
- [ ] A unit test verifies that a key like `refreshToken`, `accessToken`, or `apiKey` is stripped even without being in a denylist
- [ ] The `LoggingInterceptor` URL sanitization is also reviewed for consistency

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Replace `SENSITIVE_KEYS` denylist with `ALLOWED_METADATA_KEYS` allowlist | packages/api/src/services/AuditLogService.ts |
| API | Add recursive sanitization for nested metadata objects | packages/api/src/services/AuditLogService.ts |
| API | Review and update `LoggingInterceptor` URL sanitization for consistency | packages/api/src/common/interceptors/logging.interceptor.ts |
| API | Unit tests for allowlist sanitization | packages/api/src/services/AuditLogService.test.ts |

**Dependencies**: E2-US07

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Known safe metadata keys are preserved
  Given an audit log entry with metadata { email: "user@example.com", reason: "duplicate_email" }
  When the entry is logged
  Then both "email" and "reason" should appear in the sanitized output

Scenario: Unknown metadata keys are stripped
  Given an audit log entry with metadata { email: "user@example.com", refreshToken: "secret123" }
  When the entry is logged
  Then "email" should appear in the sanitized output
  And "refreshToken" should NOT appear

Scenario: Nested objects are sanitized
  Given an audit log entry with metadata { details: { password: "secret", reason: "locked" } }
  When the entry is logged
  Then nested sensitive keys should be stripped or the nested object should be flattened

Scenario: All existing audit log calls still work
  Given the existing auth controller audit log calls
  When a user logs in, registers, or resets password
  Then audit entries should include the same safe fields as before
```
