# E2-US01: JWT Secret & Token Revocation

**User Story**: As a platform operator, I want JWT secrets to be strictly managed and tokens to be revocable so that compromised sessions can be terminated immediately.

**Acceptance Criteria**:
- [x] Application refuses to start without an explicit `JWT_SECRET` environment variable in all environments
- [x] The hardcoded development fallback secret is removed from `JwtService.ts`
- [x] A token blacklist store exists (database table or Redis)
- [x] Logout adds the current token to the blacklist
- [x] `AuthGuard` rejects blacklisted tokens before payload extraction
- [x] Expired blacklist entries are cleaned up automatically
- [x] Roles are re-fetched from the database on each request (or tokens are short-lived with refresh rotation)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Remove hardcoded JWT fallback secret; throw on missing `JWT_SECRET` | packages/api/src/services/JwtService.ts |
| Database | Add `token_blacklist` table (token_hash, expires_at, created_at) | packages/database/src/schema.sqlite.ts |
| Database | Token blacklist repository adapter | packages/database/src/adapters/DrizzleTokenBlacklistRepository.ts |
| Domain | TokenBlacklistRepository port | packages/domain/src/ports/TokenBlacklistRepository.ts |
| API | Update `AuthGuard` to check blacklist on every request | packages/api/src/common/guards/auth.guard.ts |
| API | Update logout handler to blacklist the current token | packages/api/src/controllers/auth.controller.ts |
| API | Add cleanup job for expired blacklist entries | packages/api/src/services/TokenCleanupService.ts |
| API | Unit + integration tests | packages/api/src/common/guards/auth.guard.test.ts, packages/api/src/controllers/auth.controller.integration.test.ts |
| E2E | Token revocation test | e2e/tests/auth.api.spec.ts |

**Dependencies**: None

**Complexity**: M

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: Application refuses to start without JWT_SECRET
  Given JWT_SECRET is not set
  When the application starts
  Then it should throw an error and exit

Scenario: Logout invalidates the token
  Given I am logged in with a valid token
  When I call POST /auth/logout
  And I use the same token to call GET /auth/me
  Then I should receive a 401 Unauthorized

Scenario: Expired blacklist entries are cleaned up
  Given a blacklisted token with an expiration in the past
  When the cleanup job runs
  Then the entry should be removed from the blacklist table
```
