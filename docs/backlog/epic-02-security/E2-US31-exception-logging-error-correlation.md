# E2-US31: Unhandled Exception Logging & Error Correlation

**User Story**: As a platform operator, I want all unhandled exceptions to be logged with correlation IDs so that production errors can be traced through request lifecycles without leaking internal details to API consumers.

**Acceptance Criteria**:
- [ ] `HttpExceptionFilter` logs the full error (message, stack trace, request path) server-side for non-HttpException errors before returning the generic response
- [ ] Every incoming request is assigned a unique correlation ID (`X-Correlation-ID` header or auto-generated UUID)
- [ ] Correlation ID is included in all log entries (audit logs, error logs, security events) for the request lifecycle
- [ ] Correlation ID is returned in error responses so users can reference it when reporting issues
- [ ] Validation errors (Zod/class-validator) return field names and constraints but never expose internal schema structure, entity names, or database column names
- [ ] Error responses in production never include stack traces, file paths, or dependency names
- [ ] Unhandled promise rejections and uncaught exceptions are captured with structured logging before process exit

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add server-side error logging to `HttpExceptionFilter` for non-HttpException errors | packages/api/src/common/filters/http-exception.filter.ts |
| API | Create correlation ID middleware (reads `X-Correlation-ID` or generates UUID) | packages/api/src/common/middleware/correlation-id.middleware.ts |
| API | Attach correlation ID to request context for use by guards, interceptors, and filters | packages/api/src/common/middleware/correlation-id.middleware.ts |
| API | Include correlation ID in `HttpExceptionFilter` error responses | packages/api/src/common/filters/http-exception.filter.ts |
| API | Include correlation ID in `LoggingInterceptor` log entries | packages/api/src/common/interceptors/logging.interceptor.ts |
| API | Include correlation ID in `AuditLogService` entries | packages/api/src/services/AuditLogService.ts |
| API | Register correlation middleware globally in bootstrap | packages/api/src/main.ts |
| API | Add global handlers for `unhandledRejection` and `uncaughtException` with structured logging | packages/api/src/main.ts |
| API | Verify Zod validation errors do not expose internal names | packages/api/src/common/pipes/zod-validation.pipe.ts |
| API | Unit tests for error logging, correlation ID propagation, and response sanitization | packages/api/src/common/filters/http-exception.filter.test.ts, packages/api/src/common/middleware/correlation-id.middleware.test.ts |

**Dependencies**: E2-US07

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Unhandled exception is logged server-side
  Given a request triggers an unexpected error (not an HttpException)
  When the HttpExceptionFilter catches the error
  Then the full error with stack trace should be logged server-side
  And the API response should contain only "Internal server error" with a correlation ID
  And the response should not contain stack traces or file paths

Scenario: Correlation ID is generated for each request
  Given a request arrives without an X-Correlation-ID header
  When the request is processed
  Then a UUID correlation ID should be generated
  And it should appear in log entries and the response header

Scenario: Client-provided correlation ID is preserved
  Given a request includes X-Correlation-ID: "abc-123"
  When the request is processed
  Then "abc-123" should be used as the correlation ID in all log entries

Scenario: Validation errors do not expose internals
  Given a request has invalid input
  When Zod validation fails
  Then the response should include field names and constraint messages
  And the response should not include internal schema names or database column names

Scenario: Unhandled promise rejection is captured
  Given an unhandled promise rejection occurs
  When the process handler catches it
  Then the error should be logged with structured format
  And the log should include timestamp, error message, and stack trace
```
