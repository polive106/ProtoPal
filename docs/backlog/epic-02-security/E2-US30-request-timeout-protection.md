# E2-US30: Request Timeout & Resource Exhaustion Protection

**User Story**: As a platform operator, I want all API requests to have explicit timeout limits and the server to reject slow or oversized connections so that the application is protected against slow-loris, connection exhaustion, and resource starvation attacks.

**Acceptance Criteria**:
- [ ] All API requests have a maximum processing timeout of 30 seconds
- [ ] Requests exceeding the timeout receive a 408 Request Timeout response
- [ ] HTTP keep-alive timeout is configured explicitly (e.g., 65 seconds)
- [ ] HTTP headers timeout is configured (e.g., 60 seconds) to reject slow header transmission
- [ ] Database queries have a maximum timeout (e.g., 10 seconds)
- [ ] The server logs when requests are terminated due to timeout

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add request timeout middleware (30s default) | packages/api/src/main.ts |
| API | Configure HTTP server keep-alive and headers timeout | packages/api/src/main.ts |
| API | Add database query timeout configuration | packages/database/src/connections/sql.ts, packages/database/src/connections/mongo.ts |
| API | Add timeout logging to audit service | packages/api/src/services/AuditLogService.ts |
| API | Unit tests for timeout behavior | packages/api/src/main.test.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Request exceeding timeout is terminated
  Given the server has a 30-second request timeout
  When a request takes longer than 30 seconds to process
  Then the response should be 408 Request Timeout

Scenario: Keep-alive connections are closed after timeout
  Given a client opens a keep-alive connection
  When the connection is idle for more than 65 seconds
  Then the server closes the connection

Scenario: Slow header transmission is rejected
  Given a client sends HTTP headers very slowly
  When the headers take longer than 60 seconds to arrive
  Then the server closes the connection

Scenario: Database query timeout prevents long-running queries
  Given a database query runs for more than 10 seconds
  When the timeout is reached
  Then the query is cancelled and an error is returned
```
