# E2-US39: CORS Null Origin Rejection

**User Story**: As a platform operator, I want the CORS handler to reject requests with missing or null Origin headers when credentials are enabled so that server-to-server or crafted requests cannot bypass origin restrictions and access authenticated endpoints with cookies.

**Acceptance Criteria**:
- [ ] `createCorsOriginHandler()` returns `callback(null, false)` when `origin` is `undefined` or `null`
- [ ] Requests without an `Origin` header receive a CORS rejection (no `Access-Control-Allow-Origin` header in response)
- [ ] Requests from allowed origins continue to work normally
- [ ] Health check endpoints (`/health`, `/health/ready`) remain accessible without CORS (non-credentialed GET)
- [ ] Unit tests verify null/undefined origin rejection
- [ ] Integration test confirms a request without Origin header and with credentials fails

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Change `callback(null, true)` to `callback(null, false)` for null/undefined origins in `createCorsOriginHandler()` | packages/api/src/main.ts |
| API | Unit tests for CORS origin handler with null, undefined, allowed, and disallowed origins | packages/api/src/main.test.ts |
| E2E | Test that credentialed requests without Origin header are rejected | e2e/tests/auth.api.spec.ts |

**Dependencies**: E2-US03

**Complexity**: XS

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Request without Origin header is rejected
  Given the API is running with CORS enabled
  When I send a POST /auth/login request without an Origin header
  Then the response should not include Access-Control-Allow-Origin
  And the request should be rejected by the browser CORS policy

Scenario: Request with allowed Origin succeeds
  Given the API is running with CORS allowing localhost:5173
  When I send a request with Origin: http://localhost:5173
  Then the response should include Access-Control-Allow-Origin: http://localhost:5173

Scenario: Request with disallowed Origin is rejected
  Given the API is running with CORS allowing localhost:5173
  When I send a request with Origin: http://evil.com
  Then the response should not include Access-Control-Allow-Origin
```
