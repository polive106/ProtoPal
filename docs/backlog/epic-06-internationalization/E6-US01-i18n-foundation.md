# E6-US01: i18n Foundation — @acme/i18n Package

**User Story**: As a developer, I want a shared i18n package with react-i18next configuration and typed English translation keys so that web and mobile can consume translations from a single source of truth.

**Acceptance Criteria**:
- [x] `@acme/i18n` package exists in `packages/i18n/`
- [x] `i18next` and `react-i18next` are installed as dependencies
- [x] i18next is configured with English as the default language and French as a supported language
- [x] English translation files are organized by feature namespace (`auth`, `notes`, `common`)
- [x] Namespaces contain placeholder keys matching current hardcoded strings
- [x] TypeScript module augmentation provides typed `t()` keys with autocomplete
- [x] Package exports a configured i18n instance and typed `useTranslation` hook
- [x] Package builds successfully and is consumable by frontend and mobile packages

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| i18n | Create package with pnpm workspace config | packages/i18n/package.json, packages/i18n/tsconfig.json |
| i18n | Install i18next, react-i18next | packages/i18n/package.json |
| i18n | Create i18next configuration (default lang, fallback, namespaces) | packages/i18n/src/config.ts |
| i18n | Create English namespace files | packages/i18n/locales/en/common.json, packages/i18n/locales/en/auth.json, packages/i18n/locales/en/notes.json |
| i18n | Add TypeScript module augmentation for typed keys | packages/i18n/src/i18next.d.ts |
| i18n | Export configured instance and hooks from package index | packages/i18n/src/index.ts |
| Config | Add `@acme/i18n` to pnpm workspace | pnpm-workspace.yaml |

**Dependencies**: None

**Complexity**: S

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: i18n package exports a configured instance
  Given I import the i18n instance from @acme/i18n
  When I check the default language
  Then it is "en"

Scenario: Translation keys are typed
  Given I use the typed useTranslation hook
  When I call t() with an invalid key
  Then TypeScript reports a compile error

Scenario: English namespace files contain all keys
  Given I load the auth namespace
  When I look up "login.title"
  Then it returns "Sign In"
```
