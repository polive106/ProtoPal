# E2-US41: Bearer Token Delivery Client Verification

**User Story**: As a platform operator, I want the mechanism that determines whether auth tokens are returned in the response body (for mobile) or set as httpOnly cookies (for web) to be more robust than a user-controllable header so that an XSS vulnerability on the web cannot be used to extract tokens via the mobile code path.

**Acceptance Criteria**:
- [ ] The `x-client-type: mobile` header alone is not sufficient to force token delivery in the response body
- [ ] An alternative client identification mechanism is implemented (e.g., separate `/auth/login/mobile` endpoint, or signed client assertion, or checking the absence of a cookie-capable context)
- [ ] Web login always delivers tokens exclusively via httpOnly cookies regardless of headers
- [ ] Mobile login always delivers tokens in the response body
- [ ] Token delivery mode is documented for API consumers
- [ ] No regression in web or mobile login flows

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Evaluate and implement alternative client identification (separate endpoint vs. signed assertion vs. origin check) | packages/api/src/controllers/auth.controller.ts |
| API | Remove or restrict `x-client-type` header influence on token delivery | packages/api/src/controllers/auth.controller.ts |
| Mobile | Update mobile API client if endpoint changes | packages/mobile/src/lib/api.ts, packages/mobile/src/features/auth/api.ts |
| Frontend | Verify web login still uses cookie-only flow | packages/frontend/src/lib/api.ts |
| API | Unit + integration tests for both flows | packages/api/src/controllers/auth.controller.test.ts |
| E2E | Verify web login does not expose token in body | e2e/tests/auth.api.spec.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Web login sets httpOnly cookie and does not return token in body
  Given a login request without mobile client identification
  When the login succeeds
  Then the auth_token cookie should be set with httpOnly flag
  And the response body should NOT contain a "token" field

Scenario: Mobile login returns token in response body
  Given a login request from a verified mobile client
  When the login succeeds
  Then the response body should contain a "token" field
  And no auth_token cookie should be set

Scenario: Spoofed x-client-type header does not bypass cookie-only delivery
  Given a web browser sends x-client-type: mobile header
  When the login succeeds
  Then the response body should NOT contain a "token" field
  And the auth_token cookie should be set
```
