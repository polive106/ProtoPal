# E5-US01: Login Form Validation & Error Display E2E Tests

**User Story**: As a developer, I want comprehensive UI E2E tests for the login form so that client-side validation errors are verified to display correctly to users.

**Acceptance Criteria**:
- [x] E2E test verifies "Email is required" inline error appears when email field is blurred empty
- [x] E2E test verifies "Invalid email address" inline error appears for malformed email
- [x] E2E test verifies "Password is required" inline error appears when password field is blurred empty
- [x] E2E test verifies inline errors clear when the field is corrected and re-blurred
- [x] E2E test verifies "Signing in..." button text during submission
- [x] E2E test verifies error alert dismissal via close button
- [x] All new tests use data-testid selectors from the fixtures

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Frontend | Add data-testid to login inline error messages | packages/frontend/src/features/auth/ui/LoginForm.tsx |
| E2E | Add testIds for login field errors to fixtures | e2e/fixtures/index.ts |
| E2E | Write login validation E2E test suite | e2e/tests/auth/login-validation.spec.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: Empty email field shows required error
  Given I am on the login page
  When I click the email field and blur without typing
  Then I should see "Email is required" below the email input

Scenario: Invalid email format shows format error
  Given I am on the login page
  When I type "notanemail" in the email field and blur
  Then I should see "Invalid email address" below the email input

Scenario: Empty password field shows required error
  Given I am on the login page
  When I click the password field and blur without typing
  Then I should see "Password is required" below the password input

Scenario: Field error clears after correction
  Given I see an "Email is required" error on the login form
  When I type "user@example.com" and blur the email field
  Then the email error message should disappear

Scenario: Submit button shows loading text
  Given I have filled in valid credentials
  When I click submit
  Then the button text should change to "Signing in..."

Scenario: Server error alert can be dismissed
  Given I see a server error alert after failed login
  When I click the dismiss button on the alert
  Then the error alert should disappear
```
