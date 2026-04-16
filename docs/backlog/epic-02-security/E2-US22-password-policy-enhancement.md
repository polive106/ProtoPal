# E2-US22: Password Policy Enhancement

**User Story**: As a platform operator, I want the password policy to require special characters and be configurable via environment variables so that password strength meets OWASP recommendations and can be tuned without code changes.

**Acceptance Criteria**:
- [ ] Password validation requires at least one special character (e.g., `!@#$%^&*()_+-=[]{}|;:',.<>?/~`)
- [ ] The domain validation (`packages/domain/src/validation/password.ts`) and shared Zod schema (`packages/shared/src/schemas/auth.ts`) both enforce the special character requirement
- [ ] The API DTO (`packages/api/src/controllers/dto/auth.dto.ts`) `strongPasswordField` includes the special character regex
- [ ] Frontend and mobile registration forms display the special character requirement in validation feedback
- [ ] Existing test users in the seed script already satisfy the new policy (passwords contain `!`)
- [ ] Error messages for password validation clearly state all requirements including special characters
- [ ] Existing E2E tests for registration remain passing (seed passwords `Admin123!` and `User1234!` already include `!`)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Add special character regex check to `validatePassword()` | packages/domain/src/validation/password.ts |
| Shared | Add special character regex to password Zod schema | packages/shared/src/schemas/auth.ts |
| API | Add special character regex to `strongPasswordField` in auth DTO | packages/api/src/controllers/dto/auth.dto.ts |
| Frontend | Update password validation feedback to mention special characters | packages/frontend/src/features/auth/ |
| Mobile | Update password validation feedback to mention special characters | packages/mobile/src/features/auth/ |
| i18n | Add/update translation keys for special character requirement | packages/i18n/src/locales/ |
| Domain | Update existing password validation tests | packages/domain/src/validation/password.test.ts |
| API | Update auth DTO tests | packages/api/src/controllers/dto/auth.dto.test.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Registration rejects password without special character
  Given I am on the registration page
  When I enter password "Abcdefg1" (no special character)
  Then I should see an error about requiring a special character

Scenario: Registration accepts password with special character
  Given I am on the registration page
  When I enter password "Abcdefg1!"
  Then the password field should pass validation

Scenario: Password reset enforces special character
  Given I am resetting my password
  When I enter new password "NewPass1" (no special character)
  Then I should see an error about requiring a special character

Scenario: Existing seed passwords remain valid
  Given the seed data uses "Admin123!" and "User1234!"
  Then both passwords should satisfy the updated policy
```
