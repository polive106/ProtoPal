# E2-US14: Non-Production Token Exposure Hardening

**User Story**: As a security-conscious developer, I want sensitive tokens to never appear in API responses or server logs outside of the test runner so that token theft via log aggregation, staging environments, or developer tooling is prevented.

**Acceptance Criteria**:
- [ ] `POST /auth/forgot-password` only returns `resetToken` when `NODE_ENV === 'test'` (currently uses `!== 'production'`)
- [ ] `ConsoleEmailService` masks tokens in console output (shows first 8 characters only)
- [ ] `PreviewEmailService` uses `execFile()` instead of `exec()` to prevent command injection via file paths
- [ ] Token exposure behavior is consistent across all auth endpoints: only `NODE_ENV === 'test'` returns tokens in responses
- [ ] Development mode uses `PreviewEmailService` (opens browser) rather than logging raw tokens
- [ ] No raw token values appear in any `console.log` statement outside of test environment

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Change `process.env.NODE_ENV !== 'production'` to `=== 'test'` for resetToken response | packages/api/src/controllers/auth.controller.ts |
| API | Mask tokens in `ConsoleEmailService` (show first 8 chars + `...`) | packages/api/src/services/ConsoleEmailService.ts |
| API | Replace `exec()` with `execFile()` in `PreviewEmailService` | packages/api/src/services/PreviewEmailService.ts |
| API | Audit all `console.log` calls that may contain tokens and mask or remove them | packages/api/src/controllers/auth.controller.ts, packages/api/src/services/ |
| API | Unit tests verifying masked output | packages/api/src/services/ConsoleEmailService.test.ts |
| E2E | Verify tokens still available in test environment | e2e/tests/auth.api.spec.ts |

**Dependencies**: E2-US10

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Forgot-password response hides token in development
  Given NODE_ENV is 'development'
  When I call POST /auth/forgot-password with a valid email
  Then the response should not contain a "resetToken" field

Scenario: Forgot-password response includes token in test
  Given NODE_ENV is 'test'
  When I call POST /auth/forgot-password with a valid email
  Then the response should contain the "resetToken" field

Scenario: ConsoleEmailService masks tokens in output
  Given NODE_ENV is 'development'
  When a verification email is sent
  Then the console output should show the token as "abc12345..." (first 8 chars)

Scenario: PreviewEmailService uses safe command execution
  Given NODE_ENV is 'development'
  When a verification email is sent via PreviewEmailService
  Then the file is opened using execFile (no shell interpolation)
```
