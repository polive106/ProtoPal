# E6-US07: French Translations

**User Story**: As a French-speaking user, I want the entire app to be available in French so that I can use it in my native language.

**Acceptance Criteria**:
- [ ] French translation files exist for all namespaces (`auth`, `notes`, `common`)
- [ ] Every key in the English locale files has a corresponding French translation
- [ ] French translations are grammatically correct and natural (not machine-translated verbatim)
- [ ] Switching to French renders the full app in French with no English fallback strings visible
- [ ] Pluralization rules work correctly for French (if applicable)
- [ ] Date/number formatting considerations are documented for future implementation

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| i18n | Create French auth namespace | packages/i18n/locales/fr/auth.json |
| i18n | Create French notes namespace | packages/i18n/locales/fr/notes.json |
| i18n | Create French common namespace | packages/i18n/locales/fr/common.json |
| i18n | Verify key parity between en and fr namespaces | packages/i18n/locales/ |
| QA | Manual walkthrough of app in French to verify translations | — |

**Dependencies**: E6-US03, E6-US06

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: French login page displays correct translations
  Given the app language is set to French
  When I navigate to the login page
  Then I see "Se connecter" as the title
  And labels and buttons are in French

Scenario: French notes page displays correct translations
  Given the app language is set to French
  When I view the notes page
  Then empty state, buttons, and form labels are in French

Scenario: No English fallback strings visible in French mode
  Given the app language is set to French
  When I navigate through all pages
  Then no English text is visible (except user-generated content)

Scenario: Key parity between locales
  Given the en and fr locale files
  When I compare their key sets
  Then every key in en exists in fr and vice versa
```
