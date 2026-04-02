# E2-US03: CORS & Environment Hardening

**User Story**: As a platform operator, I want environment configuration to be fail-safe so that misconfigurations cannot silently disable security controls in production.

**Acceptance Criteria**:
- [x] CORS origin whitelist is enforced in all environments (no blanket allow in non-production)
- [x] Development origins are added to `CORS_ORIGINS` default list instead of bypassing validation
- [x] `DISABLE_RATE_LIMIT` is ignored when `NODE_ENV=production`
- [x] Application logs a warning if `NODE_ENV` is not explicitly set
- [x] Startup validation checks all critical env vars and fails fast with clear errors
- [x] Login DTO validates minimum password length (8 chars) for early rejection

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Remove non-production CORS bypass; use whitelist always | packages/api/src/main.ts |
| API | Add production guard for `DISABLE_RATE_LIMIT` | packages/api/src/common/guards/rate-limit.guard.ts |
| API | Add startup env validation (JWT_SECRET, NODE_ENV) | packages/api/src/main.ts |
| API | Update login DTO password validation to `min(8)` | packages/api/src/controllers/dto/auth.dto.ts |
| API | Unit tests for CORS and env validation | packages/api/src/main.test.ts |
| E2E | Verify CORS rejects unknown origins | e2e/tests/smoke.spec.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: CORS rejects unknown origin
  Given the server is running
  When a request arrives from an origin not in CORS_ORIGINS
  Then the response should not include Access-Control-Allow-Origin

Scenario: Rate limiting cannot be disabled in production
  Given NODE_ENV is 'production'
  And DISABLE_RATE_LIMIT is 'true'
  When the rate limit guard runs
  Then rate limiting should still be enforced

Scenario: Application fails to start without JWT_SECRET in production
  Given NODE_ENV is 'production'
  And JWT_SECRET is not set
  When the application starts
  Then it should exit with a clear error message
```
