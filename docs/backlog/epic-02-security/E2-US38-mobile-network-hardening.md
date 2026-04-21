# E2-US38: Mobile Network & Deep Link Hardening

**User Story**: As a platform operator, I want the mobile app to enforce HTTPS, validate deep link parameters, and apply request timeouts so that network-level attacks (MITM, resource exhaustion, malicious deep links) are mitigated.

**Acceptance Criteria**:
- [ ] API client enforces HTTPS in production — rejects `http://` base URLs when not in development mode
- [ ] All fetch requests have a configurable timeout (default 30 seconds) using AbortController
- [ ] Timed-out requests throw a descriptive error (not a generic network error)
- [ ] Deep link parameters are validated against an allowlist of expected routes and parameter formats
- [ ] Deep links cannot pass sensitive data (tokens, passwords) — these are stripped or rejected
- [ ] App clears in-memory auth token when entering background state (configurable, default off for UX)
- [ ] API client logs 401/403 responses for client-side security monitoring (without logging tokens)
- [ ] Request timeout and HTTPS enforcement are covered by unit tests

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Mobile | Add HTTPS enforcement guard in API client (skip in __DEV__) | packages/mobile/src/lib/api.ts |
| Mobile | Add AbortController timeout to all fetch requests (30s default) | packages/mobile/src/lib/api.ts |
| Mobile | Add deep link parameter validation middleware | packages/mobile/app/_layout.tsx or new deep-link-validator.ts |
| Mobile | Strip sensitive parameters (token, password, secret) from deep links | packages/mobile/src/lib/deepLinkValidator.ts |
| Mobile | Add optional background state token clearing via AppState listener | packages/mobile/src/providers/AuthProvider.tsx |
| Mobile | Log 401/403 responses (without token values) for monitoring | packages/mobile/src/lib/api.ts |
| Mobile | Unit tests for HTTPS enforcement and timeout behavior | packages/mobile/src/lib/api.test.ts |
| Mobile | Unit tests for deep link validation | packages/mobile/src/lib/deepLinkValidator.test.ts |

**Dependencies**: E2-US23

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: HTTP URL rejected in production
  Given the app is running in production mode
  When the API base URL is set to "http://api.example.com"
  Then the API client throws an error requiring HTTPS

Scenario: HTTPS URL accepted in production
  Given the app is running in production mode
  When the API base URL is set to "https://api.example.com"
  Then the API client initializes successfully

Scenario: Request times out after 30 seconds
  Given the API server does not respond
  When a request is made
  Then it is aborted after 30 seconds with a timeout error

Scenario: Deep link with token parameter is rejected
  Given a deep link "protopal://reset?token=abc123"
  When the deep link is processed
  Then the token parameter is stripped before navigation

Scenario: Valid deep link is processed normally
  Given a deep link "protopal://notes"
  When the deep link is processed
  Then navigation proceeds to the notes screen
```
