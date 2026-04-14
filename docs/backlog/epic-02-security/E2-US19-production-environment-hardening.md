# E2-US19: Production Environment Hardening

**User Story**: As a platform operator, I want the application to enforce HTTPS-only CORS origins in production, configure HSTS explicitly, and reject insecure defaults so that production deployments cannot accidentally run with development-grade security settings.

**Acceptance Criteria**:
- [ ] Startup validation in production requires `CORS_ORIGINS` to be explicitly set (no fallback to localhost defaults)
- [ ] Startup validation in production verifies all CORS origins use `https://` protocol
- [ ] Helmet is configured with explicit HSTS settings: `maxAge: 31536000`, `includeSubDomains: true`, `preload: true`
- [ ] `DEFAULT_ORIGINS` (localhost) are only included when `NODE_ENV` is `development` or `test`
- [ ] The `Referrer-Policy` header is explicitly set to `strict-origin-when-cross-origin`
- [ ] Startup logs the active security configuration (CORS origins, rate limiting status, environment) for operator verification

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add production CORS_ORIGINS validation (required, HTTPS-only) to `validateStartupEnv()` | packages/api/src/main.ts |
| API | Guard `DEFAULT_ORIGINS` behind non-production environment check | packages/api/src/main.ts |
| API | Add explicit HSTS configuration to Helmet options | packages/api/src/main.ts |
| API | Add explicit `Referrer-Policy` to Helmet configuration | packages/api/src/main.ts |
| API | Log active security configuration on startup | packages/api/src/main.ts |
| API | Unit tests for production env validation | packages/api/src/main.test.ts |

**Dependencies**: E2-US03

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Production startup fails without CORS_ORIGINS
  Given NODE_ENV is 'production'
  And CORS_ORIGINS is not set
  When the application starts
  Then it should throw an error mentioning CORS_ORIGINS is required

Scenario: Production startup fails with HTTP CORS origin
  Given NODE_ENV is 'production'
  And CORS_ORIGINS is 'http://app.example.com'
  When the application starts
  Then it should throw an error about HTTPS requirement

Scenario: Development allows localhost defaults
  Given NODE_ENV is 'development'
  And CORS_ORIGINS is not set
  When the application starts
  Then localhost:5173 and localhost:3000 should be allowed origins

Scenario: HSTS header is set in responses
  Given the application is running
  When I make any request
  Then the Strict-Transport-Security header should be present
  And it should include max-age=31536000 and includeSubDomains
```
