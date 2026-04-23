# E2-US31: Account Self-Deletion & Data Purge

**User Story**: As a user, I want to permanently delete my account and all associated data so that my personal information is removed from the system in compliance with privacy regulations (GDPR/CCPA).

**Acceptance Criteria**:
- [ ] `DELETE /auth/account` endpoint allows authenticated users to delete their own account
- [ ] Deletion requires password confirmation to prevent accidental or unauthorized deletion
- [ ] All user data is cascade-deleted: notes, user roles, verification tokens, password reset tokens, login attempts, rate limit entries
- [ ] Active tokens are blacklisted immediately upon account deletion
- [ ] The auth cookie is cleared on the response
- [ ] The endpoint is rate-limited (3 requests per hour) to prevent abuse
- [ ] An audit log entry is created before deletion (retaining only anonymized user ID, not PII)
- [ ] The response returns 204 No Content on success
- [ ] Frontend provides account deletion UI with confirmation dialog and password input
- [ ] Mobile app provides account deletion UI accessible from settings/profile
- [ ] Deletion is irreversible — no soft-delete or grace period (to comply with right-to-erasure)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Create `DeleteAccount` use case with password verification and cascade logic | `packages/domain/src/use-cases/DeleteAccount.ts` |
| Domain | Define `DeleteAccountError` for validation failures | `packages/domain/src/use-cases/DeleteAccount.ts` |
| Database | Add `deleteUser` method to `UserRepository` with cascade delete | `packages/domain/src/ports/UserRepository.ts` |
| Database | Implement cascade deletion in Drizzle adapter (all related tables) | `packages/database/src/adapters/drizzle/DrizzleUserRepository.ts` |
| Database | Implement cascade deletion in Mongo adapter | `packages/database/src/adapters/mongo/MongoUserRepository.ts` |
| API | Add `DELETE /auth/account` endpoint with password confirmation body | `packages/api/src/controllers/auth.controller.ts` |
| API | Add Zod DTO for delete account request (password field) | `packages/api/src/controllers/dto/auth.dto.ts` |
| API | Add rate limiting and audit logging to delete endpoint | `packages/api/src/controllers/auth.controller.ts` |
| Frontend | Add account deletion button and confirmation dialog to settings/profile | `packages/frontend/src/features/auth/ui/AccountDeletionDialog.tsx` |
| Frontend | Add `useDeleteAccount` hook | `packages/frontend/src/features/auth/hooks/useDeleteAccount.ts` |
| Mobile | Add account deletion UI to mobile settings screen | `packages/mobile/src/features/auth/ui/AccountDeletion.tsx` |
| Test | Unit tests for DeleteAccount use case | `packages/domain/src/use-cases/DeleteAccount.test.ts` |
| Test | Unit tests for cascade deletion in repository | `packages/database/src/adapters/drizzle/DrizzleUserRepository.test.ts` |
| E2E | E2E test for full account deletion flow | `e2e/tests/account-deletion.test.ts` |

**Dependencies**: None

**Complexity**: L

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: User deletes their account successfully
  Given I am authenticated as a verified user
  When I send DELETE /auth/account with my correct password
  Then the response status is 204
  And my user record is permanently deleted
  And all my notes are deleted
  And my auth cookie is cleared

Scenario: Account deletion requires correct password
  Given I am authenticated as a verified user
  When I send DELETE /auth/account with an incorrect password
  Then the response status is 401
  And my account is not deleted

Scenario: Deleted account tokens are invalidated
  Given I have deleted my account
  When I use my previous auth token to access /notes
  Then the response status is 401

Scenario: Account deletion is rate-limited
  Given I am authenticated as a verified user
  When I send 4 DELETE /auth/account requests within 1 hour
  Then the 4th request returns 429 Too Many Requests

Scenario: Frontend shows confirmation dialog
  Given I am on the settings page
  When I click "Delete Account"
  Then a confirmation dialog appears requiring my password
  And I must confirm the irreversible action before proceeding
```
