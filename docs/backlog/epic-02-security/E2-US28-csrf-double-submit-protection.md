# E2-US28: CSRF Double-Submit Cookie Protection

**User Story**: As a platform operator, I want defense-in-depth CSRF protection beyond `sameSite: strict` cookies so that the application is protected against CSRF attacks in older browsers and edge cases involving top-level navigations.

**Acceptance Criteria**:
- [ ] A non-httpOnly CSRF cookie is set alongside the auth cookie on login
- [ ] The frontend reads the CSRF cookie and includes its value as an `X-CSRF-Token` header on all state-changing requests (POST, PUT, PATCH, DELETE)
- [ ] The API validates that the `X-CSRF-Token` header matches the CSRF cookie value on all non-GET, non-HEAD, non-OPTIONS requests
- [ ] CSRF validation is skipped for Bearer-token authenticated requests (mobile app)
- [ ] CSRF validation is skipped for `@Public()` endpoints that don't use cookies
- [ ] CSRF token is rotated on each login/session creation
- [ ] Missing or mismatched CSRF token returns 403 Forbidden
- [ ] Mobile API client is unaffected (Bearer tokens are inherently CSRF-safe)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Create `CsrfGuard` that validates `X-CSRF-Token` header against cookie | packages/api/src/common/guards/csrf.guard.ts |
| API | Set CSRF cookie on login response | packages/api/src/controllers/auth.controller.ts |
| API | Register `CsrfGuard` as a global guard | packages/api/src/app.module.ts |
| API | Skip CSRF for Bearer-token and public routes | packages/api/src/common/guards/csrf.guard.ts |
| Frontend | Read CSRF cookie and add `X-CSRF-Token` header to API client | packages/frontend/src/lib/api.ts |
| Frontend | Unit tests for CSRF header inclusion | packages/frontend/src/lib/api.test.ts |
| API | Unit tests for CsrfGuard | packages/api/src/common/guards/csrf.guard.test.ts |
| E2E | Verify CSRF protection on mutation endpoints | e2e/tests/auth.api.spec.ts |

**Dependencies**: E2-US01

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Request with valid CSRF token succeeds
  Given I am authenticated with a cookie session
  And I include the X-CSRF-Token header matching the CSRF cookie
  When I call POST /notes
  Then the request succeeds

Scenario: Request without CSRF token is rejected
  Given I am authenticated with a cookie session
  And I do not include the X-CSRF-Token header
  When I call POST /notes
  Then the response should be 403 Forbidden

Scenario: Bearer token requests bypass CSRF check
  Given I am authenticated with a Bearer token (mobile)
  And I do not include the X-CSRF-Token header
  When I call POST /notes
  Then the request succeeds

Scenario: CSRF token is rotated on login
  Given I log in and receive a CSRF cookie
  When I log out and log in again
  Then the new CSRF cookie value should differ from the previous one
```
