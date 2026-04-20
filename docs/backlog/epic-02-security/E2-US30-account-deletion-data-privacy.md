# E2-US30: User Account Deletion & Data Privacy

**User Story**: As a user, I want to delete my account and export my personal data so that I maintain control over my information and the platform complies with data privacy principles (GDPR right to erasure and data portability).

**Acceptance Criteria**:
- [ ] `DELETE /auth/account` requires the user's current password for confirmation
- [ ] Account deletion cascades to all related data: notes, verification tokens, reset tokens, login attempts, rate limit entries, token blacklist entries, and audit log references
- [ ] Deleted accounts cannot be reused for registration for 30 days (soft-delete with `deleted_at` timestamp)
- [ ] `GET /auth/export-data` returns a JSON file containing all personal data: profile (email, name, roles), notes, and account activity timestamps
- [ ] Exported data excludes internal IDs, password hashes, and system metadata
- [ ] Account deletion is recorded in the audit log (before the user record is soft-deleted)
- [ ] Active sessions are invalidated immediately upon deletion (token version increment + blacklist)
- [ ] Rate limiting applied to both endpoints (3 requests per hour for deletion, 5 per hour for export)
- [ ] Frontend and mobile provide account deletion flow with confirmation dialog
- [ ] After deletion, user is redirected to a "Account deleted" confirmation page and logged out

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Add `DeleteAccount` use case (password verification, cascade deletion) | packages/domain/src/use-cases/DeleteAccount.ts |
| Domain | Add `ExportUserData` use case (aggregate all user data) | packages/domain/src/use-cases/ExportUserData.ts |
| Domain | Add `deleted_at` field to User entity | packages/domain/src/entities/User.ts |
| Database | Add `deleted_at` column to users table | packages/database/src/schema/schema.sqlite.ts |
| Database | Update user repository with soft-delete and cascade queries | packages/database/src/adapters/drizzle/DrizzleUserRepository.ts |
| Database | Update seed script for new schema | packages/database/src/seed.ts |
| API | Add `DELETE /auth/account` endpoint with password confirmation | packages/api/src/controllers/auth.controller.ts |
| API | Add `GET /auth/export-data` endpoint returning JSON export | packages/api/src/controllers/auth.controller.ts |
| API | Apply rate limiting to both new endpoints | packages/api/src/controllers/auth.controller.ts |
| Frontend | Add account deletion UI in settings/profile section | packages/frontend/src/features/auth/ui/DeleteAccount.tsx |
| Mobile | Add account deletion screen | packages/mobile/src/features/auth/ui/DeleteAccount.tsx |
| E2E | Account deletion and data export E2E tests | e2e/tests/account-deletion.api.spec.ts |

**Dependencies**: E2-US15, E2-US18

**Complexity**: L

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: User deletes their account with correct password
  Given I am an authenticated user
  When I call DELETE /auth/account with my correct password
  Then my account should be soft-deleted (deleted_at set)
  And all my notes should be deleted
  And all my tokens should be invalidated
  And I should be logged out

Scenario: Account deletion requires correct password
  Given I am an authenticated user
  When I call DELETE /auth/account with an incorrect password
  Then I should receive a 401 Unauthorized response
  And my account should remain active

Scenario: Deleted email cannot be reused within 30 days
  Given my account was deleted 15 days ago
  When I try to register with the same email
  Then I should receive an error about the email being unavailable

Scenario: User exports their personal data
  Given I am an authenticated user with notes
  When I call GET /auth/export-data
  Then I should receive a JSON file with my profile, notes, and activity
  And the export should not contain password hashes or internal IDs

Scenario: Account deletion is rate limited
  Given I have called DELETE /auth/account 3 times in the past hour
  When I call DELETE /auth/account again
  Then I should receive a 429 Too Many Requests response

Scenario: Account deletion is audited
  Given I am an authenticated user
  When I delete my account
  Then an ACCOUNT_DELETED audit log entry should be recorded
  And the entry should include my user ID and timestamp
```
