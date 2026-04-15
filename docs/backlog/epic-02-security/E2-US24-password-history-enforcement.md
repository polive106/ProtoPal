# E2-US24: Password History Enforcement

**User Story**: As a platform operator, I want users to be prevented from reusing their most recent passwords so that forced password rotations and password resets result in genuinely new credentials, reducing the risk of credential replay attacks.

**Acceptance Criteria**:
- [ ] A `password_history` table stores the N most recent password hashes per user (default: 5)
- [ ] When a user resets their password, the new password is checked against stored history
- [ ] If the new password matches any of the last N passwords, the reset is rejected with a clear error message
- [ ] Password history check uses bcrypt.compare against each stored hash (timing-safe)
- [ ] Old password entries beyond the retention count are automatically pruned
- [ ] Password history is populated on registration (first password) and on each subsequent change
- [ ] The history retention count (N) is configurable via environment variable with a sensible default
- [ ] Unit tests verify rejection of recently used passwords
- [ ] Unit tests verify that passwords older than the retention window are accepted

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Add `PasswordHistoryRepository` port interface | packages/domain/src/ports/PasswordHistoryRepository.ts |
| Domain | Update `ResetPassword` use case to check password history before accepting new password | packages/domain/src/use-cases/ResetPassword.ts |
| Domain | Update `RegisterUser` use case to store initial password in history | packages/domain/src/use-cases/RegisterUser.ts |
| Database | Add `password_history` table (id, user_id, password_hash, created_at) to SQLite schema | packages/database/src/schema/schema.sqlite.ts |
| Database | Add `password_history` table to PostgreSQL schema | packages/database/src/schema/schema.postgres.ts |
| Database | Add `PasswordHistoryRepository` Drizzle adapter with add, check, and prune methods | packages/database/src/adapters/drizzle/DrizzlePasswordHistoryRepository.ts |
| Database | Add MongoDB adapter for PasswordHistoryRepository | packages/database/src/adapters/mongo/MongoPasswordHistoryRepository.ts |
| API | Wire PasswordHistoryRepository into dependency injection | packages/api/src/modules/database.module.ts, packages/api/src/modules/tokens.ts |
| API | Unit tests for password history checking in ResetPassword | packages/domain/src/use-cases/ResetPassword.test.ts |
| API | Integration tests for password reset rejection with reused password | packages/api/src/controllers/auth.controller.integration.test.ts |
| E2E | Test password reset rejects recently used password | e2e/tests/auth.api.spec.ts |

**Dependencies**: E2-US06

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Password reset rejects recently used password
  Given a user has previously used password "OldPassword123"
  And the user requested a password reset
  When the user tries to set their password to "OldPassword123"
  Then the reset should fail with an error about password reuse

Scenario: Password reset accepts a new password
  Given a user has previously used passwords A, B, C, D, E
  When the user sets their password to a completely new password F
  Then the reset should succeed
  And password F should be added to the history

Scenario: Password older than retention window is accepted
  Given the retention count is 5
  And a user has used passwords A, B, C, D, E, F (A is oldest)
  When the user tries to set their password to A
  Then the reset should succeed because A is outside the 5-password window

Scenario: Registration stores initial password in history
  Given a new user registers with password "Initial123!"
  When the registration succeeds
  Then the password history should contain one entry for that user

Scenario: Old history entries are pruned
  Given a user has 6 passwords in history and retention is 5
  When the oldest entry is checked
  Then only the 5 most recent entries should remain in the table
```
