# E2-US31: API Request Timeout & Slow Loris Protection

**User Story**: As a platform operator, I want the API server to enforce request timeouts and connection limits so that slow loris attacks and hung connections cannot exhaust server resources.

**Acceptance Criteria**:
- [ ] Server-level request timeout configured (e.g., 30 seconds for regular endpoints)
- [ ] Keep-alive timeout configured appropriately (e.g., 65 seconds to exceed typical load balancer timeouts)
- [ ] Headers timeout set to prevent slow header attacks
- [ ] Long-running requests are terminated with a 408 Request Timeout
- [ ] Health endpoint remains responsive under slow-connection load
- [ ] Integration test verifies timeout behavior

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Configure `server.timeout` and `server.keepAliveTimeout` on the HTTP server instance after `app.listen()` | packages/api/src/main.ts |
| API | Configure `server.headersTimeout` to be greater than `keepAliveTimeout` | packages/api/src/main.ts |
| API | Add a NestJS timeout interceptor for per-route request timeouts | packages/api/src/common/interceptors/timeout.interceptor.ts |
| API | Apply timeout interceptor globally in `bootstrap()` | packages/api/src/main.ts |
| API | Unit test for timeout interceptor | packages/api/src/common/interceptors/timeout.interceptor.test.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Request exceeding timeout is terminated
  Given a request that takes longer than the configured timeout
  When the timeout threshold is reached
  Then the server should respond with 408 Request Timeout
  And the connection should be closed

Scenario: Normal requests complete within timeout
  Given a standard API request
  When processed normally
  Then it should complete without hitting the timeout
  And return the expected response

Scenario: Keep-alive connections are cleaned up
  Given an idle keep-alive connection
  When the keep-alive timeout expires
  Then the connection should be closed by the server
```
