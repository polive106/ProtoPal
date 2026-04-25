# E2-US39: Auth Form Autocomplete Attributes

**User Story**: As a platform operator, I want authentication form fields to have proper `autoComplete` attributes so that password managers work correctly and browsers do not cache sensitive values with incorrect heuristics.

**Acceptance Criteria**:
- [ ] Login email field has `autoComplete="email"`
- [ ] Login password field has `autoComplete="current-password"`
- [ ] Registration password field has `autoComplete="new-password"`
- [ ] Reset-password field has `autoComplete="new-password"`
- [ ] Registration first name field has `autoComplete="given-name"`
- [ ] Registration last name field has `autoComplete="family-name"`
- [ ] Mobile auth forms also include equivalent `autoComplete` props where supported by React Native
- [ ] Password managers (1Password, Bitwarden) correctly detect login vs. registration flows

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Frontend | Add `autoComplete="email"` to login email input | packages/frontend/src/features/auth/ui/LoginForm.tsx |
| Frontend | Add `autoComplete="current-password"` to login password input | packages/frontend/src/features/auth/ui/LoginForm.tsx |
| Frontend | Add `autoComplete="new-password"` to registration password input | packages/frontend/src/features/auth/ui/RegisterForm.tsx |
| Frontend | Add `autoComplete="new-password"` to reset-password input | packages/frontend/src/features/auth/ui/ResetPasswordPage.tsx |
| Frontend | Add `autoComplete="given-name"` and `autoComplete="family-name"` to name fields | packages/frontend/src/features/auth/ui/RegisterForm.tsx |
| Mobile | Add equivalent `autoComplete` props to mobile auth inputs | packages/mobile/src/features/auth/ui/ |
| Frontend | Widget tests verifying autoComplete attributes are rendered | packages/frontend/src/features/auth/widgets/ |

**Dependencies**: None

**Complexity**: XS

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Login form has correct autocomplete attributes
  Given I view the login form
  Then the email input should have autoComplete="email"
  And the password input should have autoComplete="current-password"

Scenario: Registration form has correct autocomplete attributes
  Given I view the registration form
  Then the password input should have autoComplete="new-password"
  And the first name input should have autoComplete="given-name"
  And the last name input should have autoComplete="family-name"

Scenario: Reset password form has correct autocomplete attribute
  Given I view the reset password form
  Then the new password input should have autoComplete="new-password"
```
