# E2-US10: Token Exposure Reduction

**User Story**: As a security-conscious developer, I want authentication tokens to have minimal exposure so that the risk of token theft via XSS, browser history, referrer headers, or server logs is reduced.

**Acceptance Criteria**:
- [x] `POST /auth/login` no longer returns the JWT in the response body for web clients (cookie-only)
- [x] Mobile clients (identified by `Authorization` header presence or a request header like `X-Client-Type: mobile`) still receive the token in the response body
- [x] Email verification uses `POST /auth/verify` with the token in the request body instead of `GET /auth/verify?token=`
- [x] Frontend verification page reads the token from the URL (email link) but submits it via POST body
- [x] Verification tokens are no longer logged in server access logs (no query param exposure)
- [x] Resend-verification dev-mode response no longer includes `verificationToken` in JSON (use server log instead)
- [x] Cookie `SameSite` attribute is set to `strict` (upgraded from `lax`) for web clients
- [x] Existing auth E2E tests updated for new verify endpoint

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Conditionally omit token from login response for cookie-based (web) clients | packages/api/src/controllers/auth.controller.ts |
| API | Change `GET /auth/verify` to `POST /auth/verify` accepting `{ token }` body | packages/api/src/controllers/auth.controller.ts |
| API | Add verify DTO schema with Zod validation | packages/api/src/controllers/dto/auth.dto.ts |
| API | Remove `verificationToken` from register/resend response; log to console in dev | packages/api/src/controllers/auth.controller.ts |
| API | Upgrade cookie `sameSite` from `lax` to `strict` | packages/api/src/controllers/auth.controller.ts |
| Frontend | Update verify route to POST token from URL to API body | packages/frontend/src/features/auth/api.ts |
| Frontend | Update verify page to extract token from URL and POST it | packages/frontend/src/routes/verify.tsx |
| Mobile | Ensure mobile login flow sends `X-Client-Type: mobile` header | packages/mobile/src/lib/api.ts |
| E2E | Update verification E2E tests for POST method | e2e/tests/auth.api.spec.ts |
| E2E | Update login E2E tests to not rely on token in response body | e2e/tests/auth.api.spec.ts |

**Dependencies**: E2-US02 (already done)

**Complexity**: M

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: Web login response does not include token in body
  Given a web client (no X-Client-Type header)
  When I log in with valid credentials
  Then the response body should not contain a "token" field
  And the auth_token cookie should be set

Scenario: Mobile login response includes token in body
  Given a mobile client with X-Client-Type: mobile header
  When I log in with valid credentials
  Then the response body should contain the "token" field
  And no cookie should be set

Scenario: Email verification via POST body
  Given a user with a pending verification token
  When I POST to /auth/verify with { "token": "<token>" }
  Then the user's status should be "verified"
  And the response should confirm verification

Scenario: GET /auth/verify returns 405 Method Not Allowed
  When I send a GET request to /auth/verify?token=abc
  Then the response should be 405 or 404
```
