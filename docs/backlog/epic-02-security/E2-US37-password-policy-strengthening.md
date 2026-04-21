# E2-US37: Password Policy Strengthening

**User Story**: As a platform operator, I want the password policy to require special characters and provide clear feedback on password requirements so that user accounts are protected against dictionary and brute-force attacks with stronger credentials.

**Acceptance Criteria**:
- [ ] Password validation requires at least one special character (e.g., `!@#$%^&*()_+-=[]{}|;:'",./<>?`)
- [ ] Domain password validation schema (`packages/domain/src/validation/password.ts`) enforces the new requirement
- [ ] Shared password validation schema (`packages/shared/src/schemas/auth.ts`) is updated to match
- [ ] API registration and reset-password DTOs reflect the updated validation
- [ ] Frontend registration and reset-password forms display the special character requirement
- [ ] Mobile registration and reset-password forms display the special character requirement
- [ ] Existing users are NOT forced to change passwords (requirement only applies to new passwords)
- [ ] Error messages clearly state "must contain a special character" when requirement is not met
- [ ] All unit tests for password validation are updated

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Add special character regex to password validation schema | packages/domain/src/validation/password.ts |
| Domain | Update password validation unit tests | packages/domain/src/validation/password.test.ts |
| Shared | Update shared auth schema with special character requirement | packages/shared/src/schemas/auth.ts |
| Shared | Update shared schema unit tests | packages/shared/src/schemas/auth.test.ts |
| API | Update registration and reset-password DTOs if needed | packages/api/src/controllers/dto/auth.dto.ts |
| Frontend | Update password requirement display in registration form | packages/frontend/src/features/auth/ |
| Mobile | Update password requirement display in registration form | packages/mobile/src/features/auth/ |
| E2E | Update E2E tests with passwords meeting new requirements | e2e/tests/, e2e/fixtures/index.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Password without special character is rejected
  Given I register with password "Abcdefg1"
  Then registration fails with "must contain a special character"

Scenario: Password with special character is accepted
  Given I register with password "Abcdefg1!"
  Then registration succeeds (assuming other criteria met)

Scenario: Domain validation rejects missing special character
  Given I validate "NoSpecial1" against the password schema
  Then validation fails

Scenario: Shared schema matches domain validation
  Given I validate "NoSpecial1" against the shared auth schema
  Then validation fails with the same requirement

Scenario: Existing users are not affected
  Given a user registered before the policy change with password "OldPass1"
  When they log in with "OldPass1"
  Then login succeeds (no retroactive enforcement)
```
