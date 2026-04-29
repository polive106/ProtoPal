# E2-US33: Guard Dependency Fail-Open Prevention

**User Story**: As a security engineer, I want all security guards (AuthGuard, RateLimitGuard) to fail closed when their dependencies are missing so that a misconfiguration or refactor can never silently disable authentication or rate limiting.

**Acceptance Criteria**:
- [ ] `AuthGuard` declares `tokenBlacklistRepo` and `userRepository` as required (non-optional) dependencies
- [ ] `RateLimitGuard` declares `rateLimitRepo` as a required (non-optional) dependency
- [ ] If a required guard dependency cannot be resolved at startup, NestJS throws immediately rather than silently skipping security checks
- [ ] A startup integration test verifies that all guards receive their dependencies when the app module boots
- [ ] Unit tests confirm guards reject requests (throw 500) if dependencies are somehow null, rather than returning `true`
- [ ] Existing unit tests are updated to always provide mock dependencies instead of relying on optional behavior

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Remove `?` optional markers from `tokenBlacklistRepo` and `userRepository` in `AuthGuard` | packages/api/src/common/guards/auth.guard.ts |
| API | Remove `?` optional marker from `rateLimitRepo` in `RateLimitGuard` | packages/api/src/common/guards/rate-limit.guard.ts |
| API | Remove `if (this.tokenBlacklistRepo)` / `if (this.userRepository)` / `if (!this.rateLimitRepo)` conditional bypasses | packages/api/src/common/guards/auth.guard.ts, packages/api/src/common/guards/rate-limit.guard.ts |
| API | Update guard unit tests to always inject mock dependencies | packages/api/src/common/guards/auth.guard.test.ts, packages/api/src/common/guards/rate-limit.guard.test.ts |
| API | Add startup integration test verifying guard dependency injection | packages/api/src/main.test.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: AuthGuard rejects requests when token is blacklisted
  Given a valid JWT token that has been blacklisted
  When the token is used to access a protected endpoint
  Then the guard should deny the request with 401
  And the blacklist check must not be skipped

Scenario: RateLimitGuard enforces limits with repository present
  Given the rate limit repository is injected
  When a client exceeds the rate limit
  Then the guard should deny the request with 429
  And the rate limit check must not be skipped

Scenario: Application fails to start if guard dependencies are missing
  Given the DI container cannot resolve tokenBlacklistRepo
  When the application attempts to start
  Then NestJS should throw a dependency resolution error
```
