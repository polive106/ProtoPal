# E2-US32: Mobile Client Type Header Spoofing Prevention

**User Story**: As a platform operator, I want the mobile client detection mechanism to be hardened so that web-based attackers cannot spoof the `x-client-type: mobile` header to receive JWT tokens in the response body, bypassing the httpOnly cookie protection.

**Acceptance Criteria**:
- [ ] Login endpoint no longer relies solely on `x-client-type` header to decide token delivery mechanism
- [ ] Mobile clients authenticate via a verified mechanism (e.g., client certificate, registered API key, or OAuth client_credentials with a mobile-only client ID)
- [ ] Web browser login always delivers tokens via httpOnly cookie regardless of headers
- [ ] Mobile login flow still receives Bearer tokens for secure storage
- [ ] Existing mobile and web E2E tests still pass
- [ ] New test verifies that spoofed `x-client-type: mobile` header from a web context does not expose the token in the response body

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Implement client identification strategy (API key per client type, or origin-based detection) | packages/api/src/common/guards/ or packages/api/src/services/ |
| API | Update login endpoint to use verified client identification instead of raw header | packages/api/src/controllers/auth.controller.ts |
| API | Register mobile client credentials in environment configuration | packages/api/src/main.ts, .env.example |
| Mobile | Send verified client identifier with login requests | packages/mobile/src/lib/api.ts |
| API | Unit tests for client identification | packages/api/src/controllers/auth.controller.integration.test.ts |
| E2E | Test that spoofed x-client-type header does not expose token | e2e/tests/auth.api.spec.ts |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Web login with spoofed mobile header does not expose token
  Given I send a login request from a web origin with x-client-type: mobile header
  When the login succeeds
  Then the response body should NOT contain a token field
  And the auth_token should be set as an httpOnly cookie

Scenario: Legitimate mobile client receives Bearer token
  Given I send a login request with valid mobile client credentials
  When the login succeeds
  Then the response body should contain a token field
  And no auth_token cookie should be set

Scenario: Unrecognized client type defaults to cookie-based auth
  Given I send a login request without any client type identification
  When the login succeeds
  Then the auth_token should be set as an httpOnly cookie
  And the response body should NOT contain a token field
```
