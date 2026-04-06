# E2-US14: CSRF Protection for Cookie-Based Authentication

**User Story**: As a security engineer, I want state-changing API endpoints to be protected against cross-site request forgery so that an attacker cannot trick authenticated users into performing unintended actions.

**Acceptance Criteria**:
- [ ] All state-changing endpoints (POST, PATCH, PUT, DELETE) require a CSRF token or are protected by an equivalent mechanism
- [ ] Cookie `SameSite` attribute is set to `strict` (upgraded from `lax`) for the `auth_token` cookie
- [ ] A custom header check (e.g. `X-Requested-With`) is enforced on non-GET requests as a secondary CSRF defense
- [ ] CORS preflight correctly rejects requests from disallowed origins (existing, verify coverage)
- [ ] Mobile clients using Bearer token auth are unaffected by CSRF changes
- [ ] Frontend `api.ts` fetch wrapper sends the required custom header on all requests
- [ ] Unit tests verify that requests without the custom header are rejected
- [ ] E2E tests verify that authenticated mutations still work

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Upgrade `SameSite` from `lax` to `strict` on auth_token cookie | packages/api/src/controllers/auth.controller.ts |
| API | Create `CsrfGuard` that rejects non-GET requests missing `X-Requested-With` header (skip for Bearer token auth) | packages/api/src/common/guards/csrf.guard.ts |
| API | Register `CsrfGuard` as global guard | packages/api/src/main.ts |
| API | Add `X-Requested-With` to CORS `allowedHeaders` (already present, verify) | packages/api/src/main.ts |
| Frontend | Add `X-Requested-With: XMLHttpRequest` header to fetch wrapper | packages/frontend/src/lib/api.ts |
| Mobile | Verify mobile API client is unaffected (uses Bearer, not cookies) | packages/mobile/src/lib/api.ts |
| API | Unit tests for CsrfGuard (rejects missing header, allows Bearer, allows GET) | packages/api/src/common/guards/csrf.guard.test.ts |
| E2E | Verify existing auth and notes E2E tests pass with CSRF guard | e2e/tests/auth/login.spec.ts, e2e/tests/notes/crud.spec.ts |

**Dependencies**: E2-US10

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: POST request with cookie auth and custom header succeeds
  Given an authenticated user with a valid cookie
  And the request includes X-Requested-With header
  When they create a note via POST /api/notes
  Then the response should be 201 Created

Scenario: POST request with cookie auth but missing custom header is rejected
  Given an authenticated user with a valid cookie
  And the request does NOT include X-Requested-With header
  When they send POST /api/notes
  Then the response should be 403 Forbidden

Scenario: POST request with Bearer token and no custom header succeeds
  Given a mobile client using Authorization: Bearer token
  And no X-Requested-With header is sent
  When they create a note via POST /api/notes
  Then the response should be 201 Created (Bearer auth bypasses CSRF)

Scenario: GET requests are not affected
  Given an authenticated user
  When they send GET /api/notes without X-Requested-With
  Then the response should be 200 OK

Scenario: SameSite=strict prevents cross-origin cookie sending
  Given a user is authenticated with an auth_token cookie
  When a cross-origin site submits a form to POST /api/notes
  Then the browser does not send the cookie (SameSite=strict)
```
