# E2-US23: Logging Interceptor Header Sanitization

**User Story**: As a platform operator, I want the logging interceptor to redact sensitive request headers (Authorization, Cookie) so that tokens and session identifiers cannot be leaked through application logs, log aggregation systems, or monitoring dashboards.

**Acceptance Criteria**:
- [ ] LoggingInterceptor redacts the `Authorization` header value in all log output
- [ ] LoggingInterceptor redacts the `Cookie` header value in all log output
- [ ] LoggingInterceptor redacts any custom header matching a configurable sensitive-header list
- [ ] Default sensitive headers list includes: authorization, cookie, x-api-key, x-auth-token
- [ ] Redacted headers show the header name but replace the value with `[REDACTED]`
- [ ] Request body fields matching the existing SENSITIVE_PARAMS list are also redacted in log output
- [ ] Non-sensitive headers (Content-Type, Accept, X-Client-Type) remain visible for debugging
- [ ] Unit tests verify header redaction for all sensitive headers
- [ ] Existing query parameter sanitization continues to work

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add SENSITIVE_HEADERS constant list (authorization, cookie, x-api-key, x-auth-token) | packages/api/src/common/interceptors/logging.interceptor.ts |
| API | Add header sanitization logic to LoggingInterceptor (redact sensitive header values) | packages/api/src/common/interceptors/logging.interceptor.ts |
| API | Add request body sanitization using existing SENSITIVE_PARAMS list | packages/api/src/common/interceptors/logging.interceptor.ts |
| API | Ensure sanitization is case-insensitive for header names | packages/api/src/common/interceptors/logging.interceptor.ts |
| API | Unit tests for header redaction | packages/api/src/common/interceptors/logging.interceptor.test.ts |
| API | Unit tests for body field redaction | packages/api/src/common/interceptors/logging.interceptor.test.ts |

**Dependencies**: E2-US07

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Authorization header is redacted in logs
  Given a request includes an Authorization header with a Bearer token
  When the request is logged by the interceptor
  Then the log output should show "authorization: [REDACTED]"

Scenario: Cookie header is redacted in logs
  Given a request includes a Cookie header with auth_token
  When the request is logged by the interceptor
  Then the log output should show "cookie: [REDACTED]"

Scenario: Non-sensitive headers remain visible
  Given a request includes Content-Type and X-Client-Type headers
  When the request is logged by the interceptor
  Then both header names and values should be visible in the log output

Scenario: Request body passwords are redacted
  Given a login request includes a password field in the body
  When the request is logged by the interceptor
  Then the log output should show "password: [REDACTED]"
```
