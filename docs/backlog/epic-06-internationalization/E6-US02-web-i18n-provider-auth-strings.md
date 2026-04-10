# E6-US02: Web i18n Provider & Auth Strings

**User Story**: As a user of the web app, I want login and registration screens to display translated text so that I can use the app in my preferred language.

**Acceptance Criteria**:
- [x] i18next provider is wired into the frontend app root
- [x] `@acme/i18n` is added as a frontend dependency
- [x] LoginForm uses `t()` for all user-facing strings (labels, buttons, card title/description, loading states)
- [x] RegisterForm uses `t()` for all user-facing strings
- [x] No hardcoded English strings remain in auth feature components
- [x] Existing E2E tests pass without modification (data-testid selectors are unaffected)
- [x] Auth namespace English keys match all extracted strings

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Frontend | Add `@acme/i18n` dependency | packages/frontend/package.json |
| Frontend | Initialize i18next provider in app root | packages/frontend/src/main.tsx or packages/frontend/src/routes/__root.tsx |
| Frontend | Migrate LoginForm strings to `t()` | packages/frontend/src/features/auth/ui/LoginForm.tsx |
| Frontend | Migrate RegisterForm strings to `t()` | packages/frontend/src/features/auth/ui/RegisterForm.tsx |
| Frontend | Migrate auth widgets to `t()` | packages/frontend/src/features/auth/widgets/ |
| i18n | Update auth namespace with all extracted keys | packages/i18n/locales/en/auth.json |

**Dependencies**: E6-US01

**Complexity**: S

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: Login form renders translated labels
  Given the app locale is set to English
  When I navigate to the login page
  Then I see "Sign In" as the card title
  And I see "Email" and "Password" as input labels

Scenario: Register form renders translated labels
  Given the app locale is set to English
  When I navigate to the register page
  Then I see "Create Account" as the card title
  And all form labels are rendered from translation keys

Scenario: Existing E2E tests remain green
  Given auth strings are migrated to t()
  When I run the auth E2E test suite
  Then all tests pass (selectors use data-testid, not text)
```
