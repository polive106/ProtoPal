# E7-US06: Security Headers Expansion & HSTS

**User Story**: As a platform operator, I want comprehensive HTTP security headers including HSTS so that browsers enforce HTTPS and prevent content-type sniffing attacks.

**Acceptance Criteria**:
- [ ] `Strict-Transport-Security` header is set in production (`max-age=31536000; includeSubDomains`)
- [ ] Helmet configuration explicitly enables `noSniff` (X-Content-Type-Options)
- [ ] CORS origin handler requires a valid Origin header in production (no null-origin bypass)
- [ ] CORS default origins (localhost) are only applied when `NODE_ENV !== 'production'`
- [ ] Unit tests verify headers are present in responses
- [ ] E2E test confirms security headers in production-like mode

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add HSTS configuration to Helmet (production only) | packages/api/src/main.ts |
| API | Verify `noSniff` is enabled in Helmet config | packages/api/src/main.ts |
| API | Update CORS origin handler to reject null/missing origin in production | packages/api/src/main.ts |
| API | Guard localhost fallback origins behind non-production check | packages/api/src/main.ts |
| API | Unit tests for header presence | packages/api/src/main.test.ts |
| E2E | Security header verification test | e2e/tests/smoke.spec.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: HSTS header is present in production
  Given the app is running with NODE_ENV=production
  When I make any HTTP request
  Then the response should include Strict-Transport-Security header

Scenario: CORS rejects missing origin in production
  Given the app is running with NODE_ENV=production
  When I make a request without an Origin header
  Then the CORS check should reject the request

Scenario: Localhost origins are not allowed in production
  Given the app is running with NODE_ENV=production
  When I make a request with Origin: http://localhost:5173
  Then the CORS check should reject the request
```
