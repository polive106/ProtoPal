# E2-US22: Password History & Reuse Prevention

**User Story**: As a platform operator, I want the system to prevent users from reusing recent passwords so that password resets and rotations are meaningful security improvements rather than cycling back to compromised credentials.

**Acceptance Criteria**:
- [ ] `password_history` table stores the last N password hashes per user (default: 5)
- [ ] Password reset flow rejects new passwords that match any of the user's last 5 password hashes
- [ ] Error message clearly states that the password has been used recently without revealing which one matched
- [ ] Password history entries are cascade-deleted when the user is deleted
- [ ] Old password history entries beyond the retention limit are automatically pruned on each password change
- [ ] Password comparison uses bcrypt.compare (timing-safe) against each stored hash
- [ ] Frontend displays a clear validation error when password reuse is detected
- [ ] Mobile app displays the same validation error

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add `password_history` table (id, user_id, password_hash, created_at) | packages/database/src/schema/schema.sqlite.ts |
| Database | Add `PasswordHistoryRepository` adapter | packages/database/src/adapters/drizzle/DrizzlePasswordHistoryRepository.ts |
| Domain | Add `PasswordHistoryRepository` port interface | packages/domain/src/ports/PasswordHistoryRepository.ts |
| Domain | Update `ResetPassword` use case to check password history before accepting | packages/domain/src/use-cases/ResetPassword.ts |
| Domain | Add `PASSWORD_HISTORY_LIMIT` constant (default: 5) | packages/shared/src/constants.ts |
| API | Update password reset endpoint to return password-reuse error | packages/api/src/controllers/auth.controller.ts |
| Frontend | Display password-reuse error in reset password form | packages/frontend/src/features/auth/ |
| Mobile | Display password-reuse error in reset password form | packages/mobile/src/features/auth/ |
| E2E | Password reuse rejection E2E tests | e2e/tests/auth.api.spec.ts |

**Dependencies**: E2-US06

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Password reset rejects recently used password
  Given I have changed my password 3 times (pw1 → pw2 → pw3 → pw4)
  When I try to reset my password to pw2
  Then I receive an error: "This password has been used recently. Please choose a different password."

Scenario: Password reset accepts a password outside the history window
  Given the history limit is 5 and I have changed my password 6 times
  When I try to reset my password to the oldest password (outside the window)
  Then the password reset succeeds

Scenario: Password history is pruned on change
  Given I have 5 entries in password history
  When I change my password successfully
  Then the oldest entry is removed and the new hash is stored
  And the total history count remains at 5

Scenario: Password history is deleted when user is deleted
  Given a user with password history entries
  When the user account is deleted
  Then all password history entries for that user are cascade-deleted
```
