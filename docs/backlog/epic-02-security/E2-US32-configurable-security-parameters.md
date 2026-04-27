# E2-US32: Configurable Security Parameters

**User Story**: As a platform operator, I want security-sensitive parameters (token expiry times, JWT secret length, rate limit windows) to be configurable via environment variables so that I can adjust security policies without code changes and respond quickly to security incidents.

**Acceptance Criteria**:
- [ ] Verification token expiry is configurable via `VERIFICATION_TOKEN_EXPIRY_MS` (default: 24 hours)
- [ ] Password reset token expiry is configurable via `PASSWORD_RESET_TOKEN_EXPIRY_MS` (default: 1 hour)
- [ ] JWT access token expiry is configurable via `JWT_ACCESS_TOKEN_EXPIRY` (default: 24h)
- [ ] All configurable values have sensible defaults and minimum/maximum validation
- [ ] Startup validation rejects values outside safe ranges (e.g., token expiry < 5 minutes or > 7 days)
- [ ] Active security configuration is logged at startup (values only, not secrets)
- [ ] Documentation lists all configurable security parameters with defaults and valid ranges

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Replace hardcoded constants with configurable values via constructor injection | packages/domain/src/constants.ts |
| Domain | Add validation for acceptable ranges | packages/domain/src/constants.ts |
| API | Read security parameters from environment and pass to domain services | packages/api/src/modules/services.module.ts |
| API | Add startup validation for security parameter ranges | packages/api/src/main.ts |
| API | Log active security configuration at startup | packages/api/src/main.ts |
| API | Unit tests for parameter validation and range checks | packages/api/src/main.test.ts |
| Docs | Document all configurable security parameters | docs/security-configuration.md |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Custom token expiry is respected
  Given VERIFICATION_TOKEN_EXPIRY_MS is set to 3600000 (1 hour)
  When a verification token is created
  Then it should expire after 1 hour instead of the default 24 hours

Scenario: Invalid token expiry is rejected at startup
  Given VERIFICATION_TOKEN_EXPIRY_MS is set to 60000 (1 minute)
  When the application starts
  Then startup should fail with an error about minimum token expiry

Scenario: Default values are used when env vars are not set
  Given no security parameter environment variables are set
  When the application starts
  Then verification token expiry should be 24 hours
  And password reset token expiry should be 1 hour

Scenario: Security configuration is logged at startup
  Given the application starts successfully
  Then the startup log should include token expiry values
  And the startup log should not include JWT_SECRET
```
