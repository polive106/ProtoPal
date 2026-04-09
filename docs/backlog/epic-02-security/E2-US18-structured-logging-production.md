# E2-US18: Structured Logging & Console Cleanup for Production Readiness

**User Story**: As a platform operator, I want all application logging to use structured output with proper log levels so that sensitive data is never leaked via console output and logs are queryable in production monitoring tools.

**Acceptance Criteria**:
- [ ] All `console.log` statements in production code paths replaced with a structured logger (e.g., NestJS `Logger` or `pino`)
- [ ] Seed script does not print plaintext passwords to stdout (overlaps with E2-US11 — coordinate)
- [ ] `ConsoleEmailService` only instantiated when `NODE_ENV !== 'production'`
- [ ] `PreviewEmailService` only instantiated when `NODE_ENV !== 'production'`
- [ ] Dev-only console.log statements for tokens/URLs are removed or gated behind a debug log level
- [ ] Rate limit disable flag (`DISABLE_RATE_LIMIT`) logs a warning when active
- [ ] No sensitive data (tokens, passwords, secrets) appears in any log output at any level
- [ ] Structured log entries include timestamp, level, context, and message

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Replace `console.log` with NestJS `Logger` in auth controller | packages/api/src/controllers/auth.controller.ts |
| API | Replace `console.log` with `Logger` in PreviewEmailService | packages/api/src/services/PreviewEmailService.ts |
| API | Replace `console.log` with `Logger` in ConsoleEmailService | packages/api/src/services/ConsoleEmailService.ts |
| API | Add warning log when `DISABLE_RATE_LIMIT=true` is active | packages/api/src/common/guards/rate-limit.guard.ts:39 |
| API | Ensure email services are only registered for non-production environments | packages/api/src/modules/auth.module.ts |
| Database | Remove plaintext password output from seed script | packages/database/src/seed.ts:170-171 |
| API | Add unit tests verifying no sensitive data in log output | packages/api/src/services/ |

**Dependencies**: E2-US11 (Seed Production Safety — Pending, coordinates on seed password logging)

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: No plaintext tokens in log output
  Given a user registers in development mode
  When the verification email is sent
  Then no raw token values should appear in stdout
  And structured log entries should use debug level for email service activity

Scenario: Rate limit disable warning is logged
  Given DISABLE_RATE_LIMIT=true and NODE_ENV=development
  When the rate limit guard processes a request
  Then a warning should be logged indicating rate limiting is disabled

Scenario: Production does not instantiate preview email service
  Given NODE_ENV=production
  When the application bootstraps
  Then PreviewEmailService should not be registered
  And ConsoleEmailService should not be registered

Scenario: Seed script does not print passwords
  Given the seed script runs in development
  When I capture stdout
  Then no password values should appear in the output
```
