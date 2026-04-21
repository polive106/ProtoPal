# E2-US32: CSRF Protection

**User Story**: As a platform operator, I want all state-changing API requests from browser clients to include CSRF token validation so that cross-site request forgery attacks cannot exploit cookie-based authentication to perform unauthorized actions.

**Acceptance Criteria**:
- [ ] API generates a CSRF token and sends it via a response header (`X-CSRF-Token`) or a dedicated `GET /auth/csrf-token` endpoint
- [ ] All state-changing endpoints (POST, PUT, PATCH, DELETE) require a valid `X-CSRF-Token` header from browser clients
- [ ] CSRF validation is skipped for mobile clients using Bearer token authentication (CSRF is not relevant for non-cookie auth)
- [ ] Frontend API client extracts the CSRF token from response headers and includes it in all mutation requests
- [ ] CSRF tokens are tied to the user session and rotated on login/logout
- [ ] Invalid or missing CSRF tokens return 403 Forbidden with a generic error message
- [ ] SameSite=Strict cookie attribute is verified as an additional CSRF defense layer
- [ ] CSRF protection does not break existing E2E tests (tests obtain and send tokens)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add CSRF token generation service (crypto random, session-bound) | packages/api/src/services/CsrfService.ts |
| API | Add CSRF validation guard applied to all non-GET/HEAD/OPTIONS routes | packages/api/src/common/guards/csrf.guard.ts |
| API | Send CSRF token in response header on login and /auth/me | packages/api/src/controllers/auth.controller.ts |
| API | Skip CSRF validation when Authorization: Bearer header is present | packages/api/src/common/guards/csrf.guard.ts |
| API | Unit tests for CSRF guard and token service | packages/api/src/common/guards/csrf.guard.test.ts |
| Frontend | Extract CSRF token from response headers in API client | packages/frontend/src/lib/api.ts |
| Frontend | Include X-CSRF-Token header in all mutation requests | packages/frontend/src/lib/api.ts |
| E2E | Update E2E test fixtures to obtain and send CSRF tokens | e2e/fixtures/index.ts |

**Dependencies**: E2-US01

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Mutation request without CSRF token is rejected
  Given I am authenticated via cookie in a browser
  When I call POST /notes without an X-CSRF-Token header
  Then the response should be 403 Forbidden

Scenario: Mutation request with valid CSRF token succeeds
  Given I am authenticated via cookie and have a CSRF token
  When I call POST /notes with a valid X-CSRF-Token header
  Then the request succeeds normally

Scenario: Mobile Bearer auth skips CSRF validation
  Given I am authenticated via Bearer token (mobile client)
  When I call POST /notes without an X-CSRF-Token header
  Then the request succeeds normally

Scenario: CSRF token is rotated on login
  Given I have a CSRF token from a previous session
  When I log in again and receive a new CSRF token
  Then the old CSRF token is no longer valid

Scenario: Invalid CSRF token is rejected
  Given I am authenticated via cookie
  When I call DELETE /notes/:id with a forged X-CSRF-Token
  Then the response should be 403 Forbidden
```
