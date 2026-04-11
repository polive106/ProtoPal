# E8-US08: Development Token Exposure Cleanup

**User Story**: As a security engineer, I want development and test environments to minimize token exposure so that tokens cannot leak through logs, API responses, or browser history.

**Acceptance Criteria**:
- [ ] Console logging of raw verification tokens in development mode is removed or replaced with truncated/hashed output
- [ ] Console logging of raw password reset tokens in development mode is removed or replaced with truncated/hashed output
- [ ] `ConsoleEmailService` does not log full token values — only last 8 characters for debugging
- [ ] Verification and reset tokens are only returned in API response bodies when `NODE_ENV === 'test'` (not in `'development'`)
- [ ] Password reset token is not exposed as a URL query parameter on the frontend — the existing POST-body approach is verified
- [ ] Email verification flow uses POST with token in request body (not GET with query param) — verified end-to-end

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Replace `console.log('[DEV] Verification token:', token)` with truncated version (last 8 chars) | packages/api/src/controllers/auth.controller.ts |
| API | Replace `console.log('[DEV] Reset token:', token)` with truncated version | packages/api/src/controllers/auth.controller.ts |
| API | Update ConsoleEmailService to log only last 8 characters of tokens | packages/api/src/services/ConsoleEmailService.ts |
| API | Remove token from response body in development mode (keep only in test mode) | packages/api/src/controllers/auth.controller.ts |
| Frontend | Verify reset-password route sends token via POST body (not query param in referer) | packages/frontend/src/features/auth/ |
| API | Unit tests verifying truncated token logging | packages/api/src/services/ConsoleEmailService.test.ts |

**Dependencies**: E2-US10 (Token Exposure Reduction — extends existing token exposure controls)

**Complexity**: S

**Status**: Pending

**Security Context**:
- **Severity**: Medium
- **Files**: 
  - `packages/api/src/controllers/auth.controller.ts` (Lines 112, 176, 304-306)
  - `packages/api/src/services/ConsoleEmailService.ts` (Lines 6, 11)
- **Issues**:
  1. **Full tokens in console**: Development console logs contain complete, usable tokens. If development environments use centralized log aggregation (CloudWatch, Datadog, etc.), these tokens could be accessed by anyone with log access.
  2. **Tokens in dev API responses**: In development mode, verification tokens are returned in the API response body. If a developer's browser request is captured (dev tools, proxy), the token is visible.
  3. **Token in URL**: The frontend reset-password route accepts a token as a URL search parameter (`?token=...`). URL query parameters appear in browser history, HTTP Referer headers, and web server access logs. E2-US10 moved verification to POST, but the reset password token handling should be verified.

**Test Scenarios**:
```gherkin
Scenario: Development console does not log full tokens
  Given the app is running in development mode
  When a verification email is triggered
  Then the console output should show only the last 8 characters of the token

Scenario: Tokens are not in API responses in development mode
  Given NODE_ENV is "development"
  When I call POST /auth/register
  Then the response body should not contain a verificationToken field

Scenario: Tokens are in API responses in test mode
  Given NODE_ENV is "test"
  When I call POST /auth/register
  Then the response body should contain a verificationToken field (for test automation)

Scenario: Reset password token is sent via POST body
  Given a user has a password reset token
  When they submit a new password
  Then the token should be sent in the POST request body (not as a URL parameter)
```
