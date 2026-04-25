# E2-US31: Breached Password Detection

**User Story**: As a platform operator, I want the system to reject commonly breached passwords during registration and password changes so that users cannot set weak passwords like `Password1` that meet complexity rules but are trivially guessable.

**Acceptance Criteria**:
- [ ] Password validation checks against a local list of the top 10,000 most common breached passwords
- [ ] The breached password list is stored as a static asset in the domain package (not fetched at runtime)
- [ ] Registration and password-reset flows reject passwords found in the breached list
- [ ] The rejection message is user-friendly: "This password has appeared in a data breach. Please choose a different password."
- [ ] The check is case-insensitive (e.g., `password1` and `Password1` are both rejected)
- [ ] The breached list is loaded once at startup and cached in memory for fast lookup (Set or Bloom filter)
- [ ] Frontend displays the breach warning inline (same as other validation errors)
- [ ] Existing password complexity rules (uppercase, lowercase, number, 8-72 chars) remain in place

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Add top-10000 breached password list as a static text file | packages/domain/src/data/breached-passwords.txt |
| Domain | Create `isBreachedPassword()` function with case-insensitive Set lookup | packages/domain/src/validation/password.ts |
| Domain | Integrate breached check into `validatePassword()` | packages/domain/src/validation/password.ts |
| Domain | Unit tests for breached password detection | packages/domain/src/validation/password.test.ts |
| Shared | Add error key for breached password | packages/shared/src/error-keys.ts |
| Frontend | Add breached password error message to i18n translations | packages/i18n/src/locales/en/translation.json |
| Frontend | Display breach warning in registration and reset-password forms | packages/frontend/src/features/auth/ |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Common breached password is rejected
  Given I try to register with password "Password1"
  When the validation runs
  Then it should fail with "This password has appeared in a data breach"

Scenario: Case-insensitive breach check
  Given I try to register with password "PASSWORD1"
  When the validation runs
  Then it should fail with a breach warning

Scenario: Unique strong password is accepted
  Given I try to register with password "Xk9#mP2$vL7nQ4w"
  When the validation runs
  Then it should pass all validation checks

Scenario: Breached check works alongside complexity rules
  Given I try to register with password "abc"
  When the validation runs
  Then it should fail with complexity errors (not breach error)
```
