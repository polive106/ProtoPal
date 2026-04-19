# E2-US21: Two-Factor Authentication (TOTP)

**User Story**: As a platform operator, I want users (especially admins) to be able to enable time-based one-time password (TOTP) authentication so that compromised passwords alone are insufficient to gain access to accounts.

**Acceptance Criteria**:
- [ ] `POST /auth/2fa/setup` generates a TOTP secret and returns a provisioning URI (for QR code) and backup codes
- [ ] `POST /auth/2fa/verify-setup` accepts a TOTP code to confirm setup and enable 2FA for the user
- [ ] `POST /auth/2fa/disable` accepts a TOTP code and disables 2FA for the user
- [ ] Login flow requires a second step (`POST /auth/2fa/challenge`) when user has 2FA enabled
- [ ] TOTP secrets are encrypted at rest in the database (not stored in plaintext)
- [ ] 10 single-use backup codes are generated during setup, stored hashed (bcrypt)
- [ ] Backup codes can be used in place of TOTP code for account recovery
- [ ] Used backup codes are marked as consumed and cannot be reused
- [ ] `POST /auth/2fa/regenerate-backup-codes` generates new backup codes (invalidates old ones)
- [ ] Admin role users are prompted (not forced) to enable 2FA on first login
- [ ] 2FA setup and disable actions are recorded in the audit log
- [ ] Rate limiting applied to 2FA challenge endpoint (5 attempts per 15 minutes)
- [ ] Frontend provides 2FA setup flow with QR code display and backup code download
- [ ] Mobile app supports 2FA challenge step during login

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Shared | Add 2FA-related types and constants | packages/shared/src/constants.ts |
| Database | Add `totp_secrets` table (id, user_id, encrypted_secret, is_enabled, created_at) | packages/database/src/schema/schema.sqlite.ts |
| Database | Add `backup_codes` table (id, user_id, code_hash, used_at, created_at) | packages/database/src/schema/schema.sqlite.ts |
| Database | Add `TotpRepository` adapter | packages/database/src/adapters/drizzle/DrizzleTotpRepository.ts |
| Domain | Add `TotpRepository` port interface | packages/domain/src/ports/TotpRepository.ts |
| Domain | Add `SetupTotp` use case | packages/domain/src/use-cases/SetupTotp.ts |
| Domain | Add `VerifyTotp` use case | packages/domain/src/use-cases/VerifyTotp.ts |
| Domain | Add `DisableTotp` use case | packages/domain/src/use-cases/DisableTotp.ts |
| API | Add 2FA controller with setup, verify, challenge, disable endpoints | packages/api/src/controllers/two-factor.controller.ts |
| API | Update login flow to detect 2FA-enabled users and require challenge | packages/api/src/controllers/auth.controller.ts |
| API | Add TOTP validation using `otpauth` or `otplib` library | packages/api/src/services/TotpService.ts |
| Frontend | Add 2FA setup page with QR code rendering | packages/frontend/src/features/auth/ui/TwoFactorSetup.tsx |
| Frontend | Add 2FA challenge step in login flow | packages/frontend/src/features/auth/ui/TwoFactorChallenge.tsx |
| Mobile | Add 2FA challenge screen in login flow | packages/mobile/src/features/auth/ui/TwoFactorChallenge.tsx |
| E2E | 2FA setup, login challenge, backup code, and disable E2E tests | e2e/tests/two-factor.api.spec.ts |

**Dependencies**: E2-US01, E2-US15

**Complexity**: XL

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: User sets up 2FA
  Given I am an authenticated user without 2FA enabled
  When I call POST /auth/2fa/setup
  Then I receive a provisioning URI and 10 backup codes
  And 2FA is not yet active until verification

Scenario: User verifies 2FA setup with valid TOTP code
  Given I initiated 2FA setup
  When I call POST /auth/2fa/verify-setup with a valid TOTP code
  Then 2FA is enabled for my account
  And the action is recorded in the audit log

Scenario: Login requires 2FA challenge when enabled
  Given I have 2FA enabled
  When I log in with valid email and password
  Then I receive a 2FA challenge response (not a full session)
  And I must call POST /auth/2fa/challenge with a valid TOTP code to complete login

Scenario: Backup code can be used instead of TOTP
  Given I have 2FA enabled and have unused backup codes
  When I submit a valid backup code during 2FA challenge
  Then login succeeds
  And the backup code is marked as consumed

Scenario: Rate limiting on 2FA challenge
  Given I have 2FA enabled
  When I submit 6 invalid TOTP codes within 15 minutes
  Then I receive a 429 Too Many Requests response

Scenario: User disables 2FA
  Given I have 2FA enabled
  When I call POST /auth/2fa/disable with a valid TOTP code
  Then 2FA is disabled for my account
  And the action is recorded in the audit log
```
