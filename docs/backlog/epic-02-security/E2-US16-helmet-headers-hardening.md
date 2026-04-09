# E2-US16: Security Headers Hardening (Helmet Configuration)

**User Story**: As a platform operator, I want comprehensive HTTP security headers configured so that the application is protected against clickjacking, MIME sniffing, referrer leakage, and unnecessary browser features.

**Acceptance Criteria**:
- [ ] Helmet CSP directives extended with `styleSrc`, `imgSrc`, `fontSrc`, `connectSrc`, `frameSrc`, `baseUri`, and `formAction`
- [ ] `Referrer-Policy` header set to `strict-origin-when-cross-origin` or stricter
- [ ] `Permissions-Policy` header disables unused features (camera, microphone, geolocation, payment)
- [ ] HSTS header configured with `maxAge: 31536000`, `includeSubDomains: true`
- [ ] `X-Content-Type-Options: nosniff` is present (Helmet default, verify not disabled)
- [ ] E2E test or integration test verifies security headers are present in responses
- [ ] Existing functionality not broken by stricter CSP (verify frontend loads correctly)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Extend Helmet CSP directives with `styleSrc`, `imgSrc`, `fontSrc`, `connectSrc`, `frameSrc`, `baseUri`, `formAction` | packages/api/src/main.ts:58-69 |
| API | Add `referrerPolicy` configuration to Helmet | packages/api/src/main.ts:58-69 |
| API | Add `permissionsPolicy` to disable unused browser features | packages/api/src/main.ts:58-69 |
| API | Verify HSTS is enabled with appropriate settings | packages/api/src/main.ts:58-69 |
| API | Add unit test for security header presence | packages/api/src/main.test.ts |
| E2E | Add E2E assertion checking key security headers in responses | e2e/tests/ |

**Dependencies**: E2-US07 (Security Headers & Audit Logging — Done)

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: CSP header includes all required directives
  Given the server is running
  When I make a GET request to /health
  Then the Content-Security-Policy header should include default-src 'self'
  And it should include script-src 'self'
  And it should include object-src 'none'
  And it should include frame-ancestors 'none'
  And it should include base-uri 'self'
  And it should include form-action 'self'

Scenario: Referrer-Policy header is set
  Given the server is running
  When I make any request
  Then the Referrer-Policy header should be "strict-origin-when-cross-origin" or stricter

Scenario: Permissions-Policy disables unused features
  Given the server is running
  When I make any request
  Then the Permissions-Policy header should disable camera, microphone, and geolocation

Scenario: HSTS header is present
  Given the server is running in production mode
  When I make any request
  Then the Strict-Transport-Security header should have max-age >= 31536000
```
