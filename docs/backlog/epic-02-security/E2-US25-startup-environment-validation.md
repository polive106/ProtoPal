# E2-US25: Startup Environment Validation Hardening

**User Story**: As a platform operator, I want the application to validate all security-critical configuration at startup (including JWT secret strength, database connectivity, and rate limiting configuration) so that misconfigurations are caught immediately rather than causing silent failures at runtime.

**Acceptance Criteria**:
- [ ] `validateStartupEnv()` checks JWT_SECRET minimum length (32 characters) at startup, not just in JwtService constructor
- [ ] `validateStartupEnv()` verifies DATABASE_URL or DATABASE_PATH is set and reachable
- [ ] `validateStartupEnv()` warns if DISABLE_RATE_LIMIT is set (even in non-production)
- [ ] `validateStartupEnv()` rejects DISABLE_RATE_LIMIT=true when NODE_ENV=production
- [ ] Startup logs a summary of active security configuration: rate limiting status, CORS origins count, JWT expiry, environment name
- [ ] All validation failures in production throw fatal errors preventing startup
- [ ] All validation warnings in development are logged clearly to console
- [ ] Unit tests verify each validation rule triggers correctly

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add JWT_SECRET length validation (min 32 chars) to `validateStartupEnv()` | packages/api/src/main.ts |
| API | Add DATABASE_URL/DATABASE_PATH presence check to `validateStartupEnv()` | packages/api/src/main.ts |
| API | Add DISABLE_RATE_LIMIT=true rejection in production | packages/api/src/main.ts |
| API | Add warning log when DISABLE_RATE_LIMIT is set in any environment | packages/api/src/main.ts |
| API | Add security configuration summary log on successful startup | packages/api/src/main.ts |
| API | Remove duplicate JWT_SECRET length check from JwtService constructor (now handled at startup) | packages/api/src/services/JwtService.ts |
| API | Unit tests for all startup validation rules | packages/api/src/main.test.ts |

**Dependencies**: E2-US03

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Startup fails with short JWT_SECRET
  Given JWT_SECRET is set to "tooshort"
  When the application starts
  Then it should throw a fatal error mentioning minimum 32 characters

Scenario: Startup fails with DISABLE_RATE_LIMIT in production
  Given NODE_ENV is 'production'
  And DISABLE_RATE_LIMIT is 'true'
  When the application starts
  Then it should throw a fatal error about rate limiting in production

Scenario: Startup warns when DISABLE_RATE_LIMIT is set in development
  Given NODE_ENV is 'development'
  And DISABLE_RATE_LIMIT is 'true'
  When the application starts
  Then a warning should be logged about rate limiting being disabled
  And the application should start successfully

Scenario: Startup logs security configuration summary
  Given valid environment configuration
  When the application starts successfully
  Then the console should show: environment name, rate limiting status, CORS origin count, and JWT expiry duration

Scenario: Startup fails without database configuration
  Given neither DATABASE_URL nor DATABASE_PATH is set
  When the application starts
  Then it should throw a fatal error about missing database configuration
```
