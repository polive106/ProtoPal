# E2-US34: AuthGuard Required Dependencies

**User Story**: As a developer, I want the AuthGuard's `userRepository` dependency to be required (not optional) so that the tokenVersion check cannot be silently skipped if the dependency is misconfigured, preventing a scenario where password resets fail to invalidate existing tokens.

**Acceptance Criteria**:
- [ ] `userRepository` parameter in `AuthGuard` constructor is non-optional (remove `?` type modifier)
- [ ] Application fails to start if `userRepository` is not injected (fail-fast behavior)
- [ ] `tokenVersion` validation always runs on every authenticated request
- [ ] Existing test mocks are updated to always provide the userRepository
- [ ] No regression in authentication or authorization behavior

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Remove optional modifier from `userRepository` parameter in AuthGuard | packages/api/src/common/guards/auth.guard.ts |
| API | Remove the `if (this.userRepository)` conditional around tokenVersion check | packages/api/src/common/guards/auth.guard.ts |
| API | Update DI wiring to ensure userRepository is always provided | packages/api/src/main.ts |
| API | Update unit tests to always inject userRepository mock | packages/api/src/common/guards/auth.guard.test.ts |

**Dependencies**: None

**Complexity**: XS

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: AuthGuard always checks tokenVersion
  Given a user's tokenVersion was incremented after password reset
  When a request arrives with a JWT containing the old tokenVersion
  Then the request should be rejected with 401 Unauthorized

Scenario: Application fails to start without userRepository
  Given the AuthGuard is instantiated without a userRepository
  Then the application should throw a dependency injection error at startup
```
