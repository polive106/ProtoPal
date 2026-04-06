# E5-US04: Auth Navigation & Page Flow E2E Tests

**User Story**: As a developer, I want UI E2E tests covering navigation between auth pages and post-auth flows so that link behavior, page transitions, and state rendering are verified.

**Acceptance Criteria**:
- [x] E2E test verifies "Sign up" link on login page navigates to /register
- [x] E2E test verifies "Sign in" link on register page navigates to /login
- [x] E2E test verifies Check Email page renders after registration with email info
- [x] E2E test verifies resend verification button on Check Email page works
- [x] E2E test verifies "Sign in" link on Check Email page navigates to /login
- [x] E2E test verifies Verify Email page shows loading then success state
- [x] E2E test verifies Verify Email page shows error for invalid token
- [x] E2E test verifies "Sign in" link on Verify success page navigates to /login
- [x] E2E test verifies logout redirects to login page
- [x] E2E test verifies Dashboard "Notes" link navigates to /notes

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| E2E | Write auth navigation and page flow E2E tests | e2e/tests/auth/navigation.spec.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: Login page sign-up link navigates to register
  Given I am on the login page
  When I click the "Sign up" link
  Then I should be on the /register page

Scenario: Register page sign-in link navigates to login
  Given I am on the registration page
  When I click the "Sign in" link
  Then I should be on the /login page

Scenario: Check Email page renders after registration
  Given I have successfully registered
  Then I should see the Check Email page
  And it should display a message about checking my email

Scenario: Resend verification button works
  Given I am on the Check Email page after registration
  When I click the "Resend" button
  Then I should see a success confirmation message

Scenario: Verify Email page shows success for valid token
  Given I have a valid verification token
  When I navigate to /verify?token=<valid-token>
  Then I should see a success message
  And a "Sign in" link should be visible

Scenario: Verify Email page shows error for invalid token
  Given I navigate to /verify?token=invalid-token
  Then I should see an error message
  And a "Register" link should be visible

Scenario: Logout redirects to login
  Given I am logged in
  When I click the logout button
  Then I should be redirected to the login page

Scenario: Dashboard notes link navigates to notes
  Given I am logged in and on the dashboard
  When I click the "Notes" link
  Then I should be on the /notes page
```
