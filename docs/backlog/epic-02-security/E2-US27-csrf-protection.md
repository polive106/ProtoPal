# E2-US27: CSRF Protection

**User Story**: As a platform operator, I want state-changing API endpoints to be protected against cross-site request forgery so that authenticated users cannot be tricked into performing unintended actions by visiting malicious websites.

**Acceptance Criteria**:
- [ ] All POST, PATCH, PUT, and DELETE endpoints require a CSRF token header (e.g., `X-CSRF-Token`)
- [ ] The server generates a CSRF token per session and provides it via a dedicated endpoint or cookie
- [ ] Requests without a valid CSRF token receive a 403 Forbidden response
- [ ] The existing `SameSite=strict` cookie policy is maintained as defense-in-depth alongside CSRF tokens
- [ ] Frontend automatically includes the CSRF token header in all mutating requests
- [ ] Mobile app includes the CSRF token header in all mutating requests
- [ ] Public endpoints (login, register, health) are exempt from CSRF checks but still benefit from SameSite cookies

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Implement CSRF token generation middleware (double-submit cookie pattern) | packages/api/src/common/middleware/csrf.middleware.ts |
| API | Add CSRF guard that validates token on all non-GET/HEAD/OPTIONS requests | packages/api/src/common/guards/csrf.guard.ts |
| API | Add `@SkipCsrf()` decorator for public endpoints | packages/api/src/common/decorators/skip-csrf.decorator.ts |
| API | Apply CSRF guard globally in app.module.ts | packages/api/src/app.module.ts |
| API | Unit tests for CSRF guard and middleware | packages/api/src/common/guards/csrf.guard.test.ts |
| Frontend | Add CSRF token reading from cookie and include in API request headers | packages/frontend/src/lib/api.ts |
| Mobile | Add CSRF token header to mobile API client | packages/mobile/src/lib/api.ts |
| E2E | Verify CSRF rejection for requests without token | e2e/tests/csrf.api.spec.ts |

**Dependencies**: E2-US03

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Mutating request without CSRF token is rejected
  Given I am authenticated
  When I call POST /notes without a CSRF token header
  Then the response should be 403 Forbidden

Scenario: Mutating request with valid CSRF token succeeds
  Given I am authenticated
  And I have a valid CSRF token
  When I call POST /notes with the CSRF token header
  Then the request should succeed

Scenario: GET requests do not require CSRF token
  Given I am authenticated
  When I call GET /notes without a CSRF token header
  Then the response should be 200 OK

Scenario: Public endpoints are exempt from CSRF
  Given I am not authenticated
  When I call POST /auth/login without a CSRF token header
  Then the response should not be 403 (normal auth flow applies)

Scenario: CSRF token is rotated per session
  Given I log in and receive a CSRF token
  When I log out and log in again
  Then the new CSRF token should differ from the previous one
```
