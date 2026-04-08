# E6-US04: Web Language Switcher

**User Story**: As a user of the web app, I want to switch between English and French and have my preference remembered so that the app always displays in my chosen language.

**Acceptance Criteria**:
- [ ] A language switcher component exists in the design system or frontend
- [ ] The switcher is accessible from the app header or settings area
- [ ] Switching language immediately updates all visible text without a page reload
- [ ] Browser locale is auto-detected on first visit (falls back to English if unsupported)
- [ ] User's language preference is persisted in localStorage
- [ ] On subsequent visits, the persisted preference is used over browser locale
- [ ] The switcher displays the current language and available alternatives
- [ ] E2E tests pass without modification

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Frontend | Create LanguageSwitcher component | packages/frontend/src/components/LanguageSwitcher.tsx |
| Frontend | Add browser locale detection using i18next-browser-languagedetector | packages/frontend/package.json, packages/i18n/src/config.ts |
| Frontend | Configure localStorage persistence plugin | packages/i18n/src/config.ts |
| Frontend | Place LanguageSwitcher in app layout/header | packages/frontend/src/routes/__root.tsx |
| i18n | Add i18next-browser-languagedetector dependency | packages/i18n/package.json |

**Dependencies**: E6-US02

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Language switcher changes app language
  Given I am on the login page in English
  When I switch the language to French
  Then all visible text updates to French immediately
  And no page reload occurs

Scenario: Browser locale is detected on first visit
  Given my browser language is set to French
  And I have no stored language preference
  When I visit the app for the first time
  Then the app displays in French

Scenario: Language preference persists across sessions
  Given I switch the language to French
  When I close and reopen the app
  Then the app displays in French

Scenario: Unsupported locale falls back to English
  Given my browser language is set to Japanese
  When I visit the app for the first time
  Then the app displays in English
```
