# E2-US34: Token Invalidation Race Condition Fix

**User Story**: As a platform operator, I want token marking and invalidation operations to be atomic so that race conditions between concurrent token operations cannot leave tokens in an inconsistent state.

**Acceptance Criteria**:
- [ ] `ResetPassword.execute()` marks the token as used and invalidates other user tokens in a sequential, deterministic order (not `Promise.all`)
- [ ] The token is marked as used BEFORE other tokens for the user are invalidated
- [ ] `VerifyEmail.execute()` invalidates all other verification tokens for the user after successful verification
- [ ] MongoDB adapters use transactions or ordered writes for multi-step token operations where supported
- [ ] Drizzle adapters use transactions for multi-step token operations
- [ ] Unit tests verify correct ordering of mark-used and invalidate operations

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Change `Promise.all([markUsed, invalidateByUserId])` to sequential execution in `ResetPassword` | packages/domain/src/use-cases/ResetPassword.ts |
| Domain | Add `invalidateByUserId` call after `markVerified` in `VerifyEmail` to clean up remaining tokens | packages/domain/src/use-cases/VerifyEmail.ts |
| Database | Add transaction support to Drizzle token repositories for atomic mark+invalidate | packages/database/src/adapters/drizzle/DrizzlePasswordResetTokenRepository.ts |
| Database | Add transaction support to MongoDB token repositories | packages/database/src/adapters/mongo/MongoPasswordResetTokenRepository.ts |
| Domain | Unit tests verifying sequential execution order | packages/domain/src/use-cases/ResetPassword.test.ts |
| Domain | Unit tests for verification token cleanup after verify | packages/domain/src/use-cases/VerifyEmail.test.ts |

**Dependencies**: E2-US06

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Password reset token is marked used before invalidation
  Given a user has multiple pending password reset tokens
  When they submit a valid reset token
  Then the submitted token is marked as used first
  And then all other reset tokens for the user are invalidated
  And the password is updated successfully

Scenario: Email verification cleans up remaining tokens
  Given a user has multiple pending verification tokens
  When they verify with a valid token
  Then the submitted token is marked as verified
  And all other verification tokens for the user are invalidated
  And the user status is updated to approved

Scenario: Concurrent reset attempts don't corrupt state
  Given a valid password reset token exists
  When two reset requests arrive simultaneously for the same token
  Then only one succeeds
  And the token cannot be reused
```
