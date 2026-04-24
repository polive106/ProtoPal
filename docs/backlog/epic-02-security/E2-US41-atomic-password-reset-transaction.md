# E2-US41: Atomic Password Reset Transaction Safety

**User Story**: As a platform operator, I want password reset operations to be atomic so that a partial failure cannot leave the system in an inconsistent state where old reset tokens remain valid after a password change.

**Acceptance Criteria**:
- [ ] Password hash update, token version increment, token mark-as-used, and token family invalidation execute within a single database transaction
- [ ] If any step fails, the entire operation rolls back (password unchanged, tokens unchanged)
- [ ] Concurrent reset attempts for the same user are serialized (no race condition where two tokens can be used simultaneously)
- [ ] Unit tests verify rollback behavior on partial failure
- [ ] Unit tests verify concurrent reset attempts are handled safely

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Add transaction support to `ResetPassword` use case (accept a `TransactionManager` port or wrap operations) | packages/domain/src/use-cases/ResetPassword.ts |
| Domain | Add `TransactionManager` port interface (if not already present) | packages/domain/src/ports/TransactionManager.ts |
| Database | Implement `TransactionManager` adapter for Drizzle (SQLite/PostgreSQL) | packages/database/src/adapters/drizzle/DrizzleTransactionManager.ts |
| Database | Implement `TransactionManager` adapter for MongoDB | packages/database/src/adapters/mongo/MongoTransactionManager.ts |
| API | Wire `TransactionManager` into DI for `ResetPassword` use case | packages/api/src/modules/domain.module.ts |
| Domain | Unit tests for atomic rollback on failure | packages/domain/src/use-cases/ResetPassword.test.ts |
| Domain | Unit tests for concurrent reset serialization | packages/domain/src/use-cases/ResetPassword.test.ts |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Password reset rolls back on token invalidation failure
  Given a valid password reset token exists
  And the token invalidation step will fail
  When the user submits a password reset
  Then the password should remain unchanged
  And the reset token should still be valid (not marked used)
  And the token version should remain the same

Scenario: Concurrent reset attempts are serialized
  Given a valid password reset token exists
  When two reset requests arrive simultaneously for the same user
  Then only one should succeed
  And the other should fail with an invalid/used token error

Scenario: Successful reset is fully atomic
  Given a valid password reset token exists
  When the user resets their password
  Then the password hash, token version, token used_at, and family invalidation are all committed together
```
