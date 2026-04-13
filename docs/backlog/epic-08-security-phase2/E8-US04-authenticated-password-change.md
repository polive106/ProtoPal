# E8-US04: Authenticated Password Change

**User Story**: As an authenticated user, I want to change my password without going through the forgot-password email flow so that I can quickly rotate my credentials if I suspect compromise.

**Security Finding**: There is no endpoint for authenticated users to change their password. The only way to change a password is through the forgot-password flow (`POST /auth/forgot-password` → email → `POST /auth/reset-password`), which requires email access. If a user suspects their password is compromised but still has an active session, they cannot immediately change it without email round-trip.

**Current State**:
- `POST /auth/reset-password` exists but requires a reset token from email
- No `POST /auth/change-password` or `PATCH /auth/password` endpoint
- `packages/domain/src/validation/password.ts` — password validation logic exists and can be reused
- Token version increment on password change already exists in `ResetPassword.ts` line 65

**Acceptance Criteria**:
- [ ] A `POST /auth/change-password` endpoint accepts `{ currentPassword, newPassword }` from authenticated users
- [ ] The endpoint verifies the current password before accepting the change
- [ ] The new password is validated against the same rules as registration (min 8, uppercase, lowercase, digit, max 72)
- [ ] The new password must differ from the current password
- [ ] Token version is incremented, invalidating all existing sessions
- [ ] An audit log entry is created for password changes
- [ ] Rate limited to prevent brute-force current password guessing (5 per 15 min)
- [ ] Frontend and mobile provide a "Change Password" UI in settings/profile
- [ ] Unit, integration, and E2E tests

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Add `ChangePassword` use case | packages/domain/src/use-cases/ChangePassword.ts |
| Domain | Unit tests for ChangePassword | packages/domain/src/use-cases/ChangePassword.test.ts |
| API | Add `POST /auth/change-password` endpoint with auth guard | packages/api/src/controllers/auth.controller.ts |
| API | Add `changePasswordSchema` DTO validation | packages/api/src/controllers/dto/auth.dto.ts |
| API | Wire ChangePassword use case in DomainModule | packages/api/src/modules/domain.module.ts |
| API | Integration tests | packages/api/src/controllers/auth.controller.integration.test.ts |
| Frontend | Add change password form in profile/settings | packages/frontend/src/features/auth/ |
| Mobile | Add change password screen | packages/mobile/src/features/auth/ |
| E2E | Password change E2E tests | e2e/tests/ |

**Dependencies**: None (E8-US01 is recommended but not required)

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: User changes password successfully
  Given I am logged in
  When I call POST /auth/change-password with my current and new password
  Then my password is updated
  And my token version is incremented
  And all other sessions are invalidated

Scenario: Wrong current password is rejected
  Given I am logged in
  When I call POST /auth/change-password with an incorrect current password
  Then I receive a 400 Bad Request
  And my password is not changed

Scenario: New password same as current is rejected
  Given I am logged in
  When I call POST /auth/change-password with the same password for both fields
  Then I receive a 400 Bad Request with "New password must differ from current password"
```
