# E2-US30: Logout Cookie Cleanup Hardening

**User Story**: As a platform operator, I want the logout cookie-clearing logic to include all original cookie attributes so that browsers reliably remove the auth cookie across all environments and configurations.

**Acceptance Criteria**:
- [ ] `res.clearCookie('auth_token', ...)` includes `httpOnly`, `secure`, `sameSite`, and `path` flags matching the original `Set-Cookie` attributes
- [ ] Cookie is reliably cleared in Chrome, Firefox, and Safari (verified via E2E test)
- [ ] Existing logout tests still pass
- [ ] New test verifies all cookie flags are passed to `clearCookie`

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Update `clearCookie` call to pass `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'strict'` | packages/api/src/controllers/auth.controller.ts |
| API | Extract shared cookie options into a constant to avoid duplication | packages/api/src/controllers/auth.controller.ts |
| API | Unit test verifying clearCookie receives matching flags | packages/api/src/controllers/auth.controller.integration.test.ts |

**Dependencies**: None

**Complexity**: XS

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Logout clears cookie with all matching flags
  Given I am logged in with an auth_token cookie
  When I call POST /auth/logout
  Then clearCookie should be called with httpOnly, secure, sameSite, and path flags
  And the auth_token cookie should be removed from the browser

Scenario: Cookie options are consistent between set and clear
  Given the login sets a cookie with httpOnly, secure, sameSite, path, and maxAge
  When logout clears the cookie
  Then all flags except maxAge should match the original set-cookie attributes
```
