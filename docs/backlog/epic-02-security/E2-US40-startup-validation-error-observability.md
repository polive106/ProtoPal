# E2-US40: Startup Validation & Error Observability Gaps

**User Story**: As a platform operator, I want the application to reject well-known placeholder secrets at startup, enforce HTTPS for mobile API URLs in production builds, and log unexpected server errors so that misconfigurations are caught early and internal errors are visible for incident response.

**Acceptance Criteria**:
- [ ] `validateStartupEnv()` rejects JWT_SECRET values that match common placeholders (e.g., containing "your-secret", "changeme", "placeholder")
- [ ] Mobile app warns or throws when `EXPO_PUBLIC_API_URL` does not start with `https://` in production builds (`__DEV__ === false`)
- [ ] `HttpExceptionFilter` logs non-HttpException errors to `console.error` (with stack trace) before returning the generic 500 response
- [ ] The error log includes a request identifier (if available) for correlation
- [ ] Startup validation errors produce clear, actionable error messages

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add JWT_SECRET placeholder detection to `validateStartupEnv()` | packages/api/src/main.ts |
| API | Add `console.error` logging for non-HttpException errors in `HttpExceptionFilter` | packages/api/src/common/filters/http-exception.filter.ts |
| Mobile | Add runtime HTTPS check for API URL when `__DEV__` is false | packages/mobile/src/lib/api.ts |
| API | Unit tests for placeholder JWT_SECRET rejection | packages/api/src/main.test.ts |
| API | Unit tests for exception logging behavior | packages/api/src/common/filters/http-exception.filter.test.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Placeholder JWT secret is rejected at startup
  Given JWT_SECRET is 'your-secret-at-least-32-characters-long'
  When the application starts
  Then it should throw an error about placeholder JWT secret

Scenario: Real JWT secret is accepted
  Given JWT_SECRET is a randomly generated 64-character string
  When the application starts
  Then startup should succeed

Scenario: Unexpected errors are logged with stack trace
  Given a TypeError occurs in a controller
  When the HttpExceptionFilter handles it
  Then the error and stack trace should be logged to console.error
  And the client should receive a generic 500 response

Scenario: Mobile warns on HTTP API URL in production
  Given __DEV__ is false
  And EXPO_PUBLIC_API_URL is 'http://api.example.com'
  When the API client initializes
  Then a warning should be logged about insecure HTTP connection
```
