# E2-US19: Transport & Cookie Security Hardening

**User Story**: As a security engineer, I want transport-layer and cookie security controls tightened so that authentication tokens are protected against interception, fixation, and cross-site leakage in production deployments.

**Acceptance Criteria**:
- [ ] HTTP Strict Transport Security (HSTS) header enabled in production with `max-age=31536000; includeSubDomains`
- [ ] `res.clearCookie('auth_token')` call in logout includes all matching attributes (`httpOnly`, `secure`, `sameSite`, `path`) to ensure reliable cookie deletion across browsers
- [ ] Cookie `secure` flag is always `true` in production (verified, not just conditional)
- [ ] Helmet configuration explicitly sets `X-Content-Type-Options: nosniff` (verify enabled by default)
- [ ] Helmet configuration explicitly sets `X-Frame-Options: DENY` (verify enabled via `frameAncestors: ['none']`)
- [ ] `Referrer-Policy` header set to `strict-origin-when-cross-origin` or `no-referrer` to prevent token leakage via referrer
- [ ] Response does not include `X-Powered-By` header (Helmet handles this, verify)
- [ ] Unit tests verify all security headers are present in production mode responses

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Enable HSTS in Helmet config for production | packages/api/src/main.ts |
| API | Add `Referrer-Policy: strict-origin-when-cross-origin` to Helmet config | packages/api/src/main.ts |
| API | Update `clearCookie` in logout to include all cookie attributes | packages/api/src/controllers/auth.controller.ts |
| API | Verify `X-Powered-By` is removed (Helmet default) | packages/api/src/main.ts |
| API | Add production guard to enforce `secure: true` on cookies | packages/api/src/controllers/auth.controller.ts |
| Tests | Add unit/integration tests verifying security headers | packages/api/src/main.test.ts |
| Tests | Add E2E test verifying logout properly clears cookie | e2e/tests/auth.api.spec.ts |
| Docs | Document required production security configuration | docs/security.md |

**Dependencies**: E2-US03 (Done)

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: HSTS header present in production
  Given the server is running in production mode
  When I make any HTTP request
  Then the response should include "Strict-Transport-Security" header
  And the max-age should be at least 31536000

Scenario: Cookie cleared with all attributes on logout
  Given a user is logged in with an auth_token cookie
  When they POST to /auth/logout
  Then the Set-Cookie header should clear auth_token
  And the clear-cookie should include httpOnly, secure, sameSite, and path attributes

Scenario: Referrer-Policy header set
  Given the server is running
  When I make any HTTP request
  Then the response should include "Referrer-Policy" header
  And the value should be "strict-origin-when-cross-origin" or "no-referrer"

Scenario: X-Powered-By header not present
  When I make any HTTP request to the API
  Then the response should NOT include an "X-Powered-By" header
```
