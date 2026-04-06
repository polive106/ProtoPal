# E5-US02: Registration Form Validation & Error Display E2E Tests

**User Story**: As a developer, I want comprehensive UI E2E tests for the registration form so that all client-side validation rules are verified to display correctly to users.

**Acceptance Criteria**:
- [ ] E2E test verifies "First name is required" inline error on empty blur
- [ ] E2E test verifies "Last name is required" inline error on empty blur
- [ ] E2E test verifies "Email is required" inline error on empty blur
- [ ] E2E test verifies "Invalid email address" inline error for malformed email
- [ ] E2E test verifies "Minimum 8 characters" inline error for short password
- [ ] E2E test verifies "Must contain an uppercase letter" error
- [ ] E2E test verifies "Must contain a lowercase letter" error
- [ ] E2E test verifies "Must contain a number" error
- [ ] E2E test verifies last name max length (100 chars) error display
- [ ] E2E test verifies email max length (254 chars) error display
- [ ] E2E test verifies multiple field errors display simultaneously
- [ ] E2E test verifies "Creating..." button text during submission
- [ ] E2E test verifies server error (e.g. duplicate email) shows error alert in UI

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| E2E | Write registration validation E2E test suite | e2e/tests/auth/register-validation.spec.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Empty first name shows required error
  Given I am on the registration page
  When I click the first name field and blur without typing
  Then I should see "First name is required" below the first name input

Scenario: Empty last name shows required error
  Given I am on the registration page
  When I click the last name field and blur without typing
  Then I should see "Last name is required" below the last name input

Scenario: Short password shows min length error
  Given I am on the registration page
  When I type "Ab1" in the password field and blur
  Then I should see "Minimum 8 characters" below the password input

Scenario: Password without uppercase shows complexity error
  Given I am on the registration page
  When I type "password1" in the password field and blur
  Then I should see "Must contain an uppercase letter" below the password input

Scenario: Password without lowercase shows complexity error
  Given I am on the registration page
  When I type "PASSWORD1" in the password field and blur
  Then I should see "Must contain a lowercase letter" below the password input

Scenario: Password without number shows complexity error
  Given I am on the registration page
  When I type "Password" in the password field and blur
  Then I should see "Must contain a number" below the password input

Scenario: Last name exceeds 100 chars shows max length error
  Given I am on the registration page
  When I type 101 characters in the last name field and blur
  Then I should see "at most 100 characters" below the last name input

Scenario: Multiple errors display simultaneously
  Given I am on the registration page
  When I blur all fields without typing anything
  Then I should see error messages for first name, last name, email, and password

Scenario: Duplicate email shows server error alert
  Given a user with email "user@example.com" exists
  When I fill the registration form with that email and submit
  Then I should see a server error alert with a message about the email
```
