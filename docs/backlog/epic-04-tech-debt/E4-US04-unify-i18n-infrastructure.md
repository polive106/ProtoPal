# E4-US04: Unify i18n Infrastructure Across Frontend and Mobile

**User Story**: As a developer, I want i18n infrastructure consolidated so that adding a new language or changing language-switching behavior requires changes in one place, not scattered across both packages.

**Acceptance Criteria**:
- [ ] A canonical `LANGUAGE_OPTIONS` array (code + display label) is exported from `@acme/i18n` and used by both LanguageSwitcher components
- [ ] Mobile `LanguageSwitcher` iterates the shared array instead of hardcoding a binary `en`/`fr` toggle (currently breaks silently if a third language is added)
- [ ] Mobile `_layout.tsx` uses `isSupportedLng()` from `@acme/i18n` instead of inline `(supportedLngs as readonly string[]).includes(...)` (2 occurrences)
- [ ] `LANG_PREF_KEY` / `LANG_STORAGE_KEY` constants are moved out of UI components into `@acme/i18n` config
- [ ] Duplicate i18n keys `signOut` and `logout` in `common.json` are unified to a single key across both platforms
- [ ] Mobile language initialization no longer blocks the splash screen; the app renders immediately with the default language and updates asynchronously
- [ ] Frontend `initBrowserLanguage()` awaits the `changeLanguage` Promise (or documents why fire-and-forget is safe)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| i18n | Export `LANGUAGE_OPTIONS` array and `LANG_PREF_KEY` constant | `packages/i18n/src/config.ts`, `packages/i18n/src/index.ts` |
| Frontend | Import `LANGUAGE_OPTIONS` from `@acme/i18n` instead of defining inline `LANGUAGES` | `packages/frontend/src/components/LanguageSwitcher.tsx` |
| Frontend | Remove local `LANG_STORAGE_KEY`, import from `@acme/i18n` | `packages/frontend/src/lib/i18nBrowser.ts` |
| Frontend | Await or document `initBrowserLanguage()` Promise handling | `packages/frontend/src/lib/i18nBrowser.ts`, `packages/frontend/src/main.tsx` |
| Mobile | Refactor `LanguageSwitcher` to iterate `LANGUAGE_OPTIONS` instead of binary toggle | `packages/mobile/src/components/LanguageSwitcher.tsx` |
| Mobile | Remove local `LANG_PREF_KEY`, import from `@acme/i18n` | `packages/mobile/src/components/LanguageSwitcher.tsx`, `packages/mobile/app/_layout.tsx` |
| Mobile | Use `isSupportedLng()` instead of inline `includes()` calls | `packages/mobile/app/_layout.tsx` |
| Mobile | Make language init non-blocking (render with default, update async) | `packages/mobile/app/_layout.tsx` |
| i18n | Unify `signOut`/`logout` to single key in `en/common.json` and `fr/common.json` | `packages/i18n/locales/en/common.json`, `packages/i18n/locales/fr/common.json` |

**Dependencies**: None

**Complexity**: M

**Status**: To Do

**Test Scenarios**:
```gherkin
Scenario: Adding a third language
  Given LANGUAGE_OPTIONS in @acme/i18n includes 'de'
  When a user opens the LanguageSwitcher on mobile
  Then all three languages are available (not just en/fr toggle)

Scenario: Mobile app launches without language blocking
  Given no saved language preference
  When the app starts
  Then the splash screen hides immediately with 'en' default
  And language preference loads asynchronously
```
