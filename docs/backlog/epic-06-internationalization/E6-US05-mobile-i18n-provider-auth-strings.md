# E6-US05: Mobile i18n Provider & Auth Strings

**User Story**: As a user of the mobile app, I want login and registration screens to display translated text so that I can use the app in my preferred language.

**Acceptance Criteria**:
- [x] i18next provider is wired into the mobile app root
- [x] `@acme/i18n` is added as a mobile dependency
- [x] `expo-localization` is installed for device locale detection
- [x] Mobile LoginForm uses `t()` for all user-facing strings
- [x] Mobile RegisterForm uses `t()` for all user-facing strings
- [x] No hardcoded English strings remain in mobile auth feature components
- [x] Device locale is detected via expo-localization and used as default
- [x] Existing Maestro E2E flows pass without modification (testID selectors unaffected)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Mobile | Add `@acme/i18n` and `expo-localization` dependencies | packages/mobile/package.json |
| Mobile | Initialize i18next provider in app root with expo-localization | packages/mobile/src/app/_layout.tsx |
| Mobile | Migrate LoginForm strings to `t()` | packages/mobile/src/features/auth/ui/LoginForm.tsx |
| Mobile | Migrate RegisterForm strings to `t()` | packages/mobile/src/features/auth/ui/RegisterForm.tsx |
| Mobile | Migrate auth widgets to `t()` | packages/mobile/src/features/auth/widgets/ |
| i18n | Verify auth namespace keys cover mobile-specific strings | packages/i18n/locales/en/auth.json |

**Dependencies**: E6-US01

**Complexity**: S

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: Mobile login renders translated labels
  Given the device locale is English
  When I open the login screen
  Then I see translated text for title, labels, and buttons

Scenario: Device locale is detected
  Given the device locale is French
  When I open the app for the first time
  Then the app displays in French

Scenario: Existing Maestro flows pass
  Given mobile auth strings are migrated to t()
  When I run the Maestro auth E2E flows
  Then all flows pass (selectors use testID, not text)
```
