# E6-US08: i18n CI Guardrails

**User Story**: As a developer, I want CI to block PRs with missing translations or hardcoded strings so that i18n completeness is enforced automatically and nothing ships untranslated.

**Acceptance Criteria**:
- [ ] TypeScript module augmentation enforces valid `t()` keys at compile time (invalid keys are TS errors)
- [ ] `eslint-plugin-i18next` (or equivalent) catches hardcoded user-facing strings in JSX
- [ ] A CI script compares keys across all locale JSON files and fails if any locale is missing keys
- [ ] `i18next-parser` is configured to extract keys from source and detect drift
- [ ] CI pipeline includes the translation completeness check as a required step
- [ ] ESLint i18n rule is integrated into the existing lint command
- [ ] Documentation in AGENTS.md or CLAUDE.md describes the i18n enforcement rules

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| i18n | Verify TypeScript module augmentation catches invalid keys | packages/i18n/src/i18next.d.ts |
| Config | Install and configure eslint-plugin-i18next | packages/frontend/.eslintrc, packages/mobile/.eslintrc |
| Config | Install and configure i18next-parser | packages/i18n/i18next-parser.config.js |
| CI | Create key-comparison script (en vs fr parity check) | scripts/check-translations.ts |
| CI | Add translation check step to CI pipeline | .github/workflows/ or turbo.json |
| Docs | Document i18n rules and enforcement in AGENTS.md | AGENTS.md |

**Dependencies**: E6-US07

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: TypeScript catches invalid translation key
  Given a developer writes t('nonexistent.key')
  When TypeScript compiles the code
  Then a type error is reported

Scenario: ESLint catches hardcoded string in JSX
  Given a developer writes <Label>Email</Label> without t()
  When ESLint runs
  Then a lint error is reported for the hardcoded string

Scenario: CI fails on missing French translation
  Given en/auth.json has key "login.title" but fr/auth.json does not
  When the CI translation check runs
  Then the check fails with a clear error message listing the missing key

Scenario: CI passes when all translations are complete
  Given en and fr locale files have identical key sets
  When the CI translation check runs
  Then the check passes

Scenario: i18next-parser detects unused keys
  Given a translation key exists in en/auth.json but is not used in source code
  When i18next-parser runs
  Then it reports the unused key
```
