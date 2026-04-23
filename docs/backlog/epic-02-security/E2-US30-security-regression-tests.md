# E2-US30: Automated Security Regression Test Suite

**User Story**: As a developer, I want automated E2E tests that verify security controls (headers, cookies, rate limits, auth guards) so that security regressions are caught in CI before reaching production.

**Acceptance Criteria**:
- [ ] E2E test verifies all expected HTTP security headers are present (CSP, X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, Referrer-Policy)
- [ ] E2E test verifies `auth_token` cookie has `httpOnly`, `sameSite=strict`, and `path=/` attributes
- [ ] E2E test verifies unauthenticated requests to protected endpoints return 401
- [ ] E2E test verifies accessing another user's notes returns 403
- [ ] E2E test verifies rate limit headers are present on rate-limited endpoints
- [ ] E2E test verifies error responses do not leak stack traces or internal paths
- [ ] E2E test verifies `X-Powered-By` header is absent
- [ ] E2E test verifies CORS rejects requests from non-whitelisted origins
- [ ] All security tests run as part of the standard CI pipeline
- [ ] Test failures block the build from merging

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| E2E | Create security headers test suite | `e2e/tests/security-headers.test.ts` |
| E2E | Create auth guard regression tests (401/403 scenarios) | `e2e/tests/security-auth-guards.test.ts` |
| E2E | Create cookie security attribute tests | `e2e/tests/security-cookies.test.ts` |
| E2E | Create error response leakage tests | `e2e/tests/security-error-responses.test.ts` |
| E2E | Create CORS validation tests | `e2e/tests/security-cors.test.ts` |
| CI | Ensure security tests are included in E2E CI workflow | `.github/workflows/e2e.yml` |

**Dependencies**: E2-US07 (Security Headers & Audit Logging)

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Security headers are present on all responses
  Given the API server is running
  When I send a GET request to /health
  Then the response includes Content-Security-Policy header
  And the response includes X-Content-Type-Options: nosniff
  And the response does not include X-Powered-By header

Scenario: Protected endpoint rejects unauthenticated request
  Given I have no authentication token
  When I send a GET request to /notes
  Then the response status is 401
  And the response body contains a generic error message
  And the response body does not contain a stack trace

Scenario: User cannot access another user's note
  Given I am authenticated as user A
  And user B has a note with id "note-b-1"
  When I send a GET request to /notes/note-b-1
  Then the response status is 403

Scenario: CORS rejects disallowed origin
  Given I send a request with Origin header "https://evil.com"
  When I send an OPTIONS request to /auth/login
  Then the response does not include Access-Control-Allow-Origin header

Scenario: Error responses do not leak internals
  Given I am authenticated as a verified user
  When I send a POST request to /notes with invalid JSON
  Then the response does not contain file paths
  And the response does not contain stack traces
  And the response does not contain "node_modules"
```
