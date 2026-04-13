# E8-US10: Audit Log & Token Exposure Hardening

**User Story**: As a platform operator, I want sensitive tokens to be excluded from all logs and non-production API responses so that tokens cannot be harvested from log aggregation systems or staging environments.

**Security Finding**: Multiple token exposure vectors exist:

1. **Audit log sensitive key filtering is incomplete** — `AuditLogService.ts` line 24 filters `['password', 'token', 'secret', 'authorization', 'cookie']` but metadata fields like `resetToken` and `verificationToken` are not caught because the filter checks exact key names, not partial matches.

2. **Non-production API responses leak tokens** — `auth.controller.ts` line 304: `response.resetToken = result.resetToken` when `NODE_ENV !== 'production'`. This means staging, preview, and any non-production deployed environment exposes password reset tokens in API responses. Similarly, verification tokens are exposed in test env (line 109).

3. **Console/Preview email services log raw tokens** — `ConsoleEmailService.ts` lines 6, 11 and `PreviewEmailService.ts` lines 59, 107 log raw tokens to stdout, which may be captured by log aggregation.

**Current State**:
- `packages/api/src/services/AuditLogService.ts` line 24: blacklist approach for sensitive keys
- `packages/api/src/controllers/auth.controller.ts` lines 109, 173, 304: token exposure in responses
- `packages/api/src/services/ConsoleEmailService.ts`: logs raw tokens
- `packages/api/src/services/PreviewEmailService.ts`: logs raw tokens

**Acceptance Criteria**:
- [ ] Audit log sanitization uses partial matching: any key containing 'token', 'password', 'secret', 'key', 'hash', 'credential' is filtered
- [ ] Reset tokens are NEVER returned in API responses (remove the `NODE_ENV !== 'production'` gate entirely)
- [ ] Verification tokens in test responses use a dedicated `X-Test-Token` header instead of response body (only in `NODE_ENV === 'test'`)
- [ ] ConsoleEmailService does NOT log raw token values (log a truncated hash prefix instead)
- [ ] PreviewEmailService does NOT log raw tokens to stdout (only writes to the HTML file)
- [ ] Unit tests verify sensitive data filtering

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Update AuditLogService to use partial key matching for sensitive fields | packages/api/src/services/AuditLogService.ts |
| API | Remove token exposure from forgot-password response | packages/api/src/controllers/auth.controller.ts |
| API | Move test verification tokens to response header | packages/api/src/controllers/auth.controller.ts |
| API | Remove raw token logging from ConsoleEmailService | packages/api/src/services/ConsoleEmailService.ts |
| API | Remove raw token logging from PreviewEmailService stdout | packages/api/src/services/PreviewEmailService.ts |
| API | Unit tests for improved sanitization | packages/api/src/services/AuditLogService.test.ts |

**Dependencies**: None

**Complexity**: XS

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Audit log filters keys containing 'token'
  Given an audit log entry with metadata { resetToken: "abc123", email: "user@example.com" }
  When the entry is logged
  Then the output should contain email but NOT resetToken

Scenario: Forgot-password response does not include reset token
  Given NODE_ENV is 'development'
  When I call POST /auth/forgot-password
  Then the response body should NOT contain a resetToken field

Scenario: Email service does not log raw tokens
  Given the ConsoleEmailService is used
  When a verification email is sent
  Then the console output should NOT contain the raw token value
```
