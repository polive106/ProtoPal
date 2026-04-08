# E6-US06: Mobile Notes, Layout & Language Switcher

**User Story**: As a user of the mobile app, I want notes, navigation, and layout text to be translated and a language switcher available so that the entire mobile experience is in my preferred language.

**Acceptance Criteria**:
- [ ] Mobile NoteDrawer/NoteForm uses `t()` for all user-facing strings
- [ ] Mobile NoteCard and NoteList use `t()` for all user-facing strings
- [ ] Mobile empty state text is translated
- [ ] Mobile navigation/tab bar labels are translated
- [ ] A language switcher is available in the mobile app (settings screen or header)
- [ ] Language preference is persisted in AsyncStorage
- [ ] On subsequent launches, the persisted preference is used over device locale
- [ ] No hardcoded English strings remain in mobile notes or layout components
- [ ] Existing Maestro E2E flows pass without modification

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Mobile | Migrate NoteDrawer/NoteForm strings to `t()` | packages/mobile/src/features/notes/ui/ |
| Mobile | Migrate NoteCard and NoteList strings to `t()` | packages/mobile/src/features/notes/widgets/ |
| Mobile | Migrate layout/navigation strings to `t()` | packages/mobile/src/app/ |
| Mobile | Migrate empty state and loading strings to `t()` | packages/mobile/src/features/notes/widgets/ |
| Mobile | Create LanguageSwitcher component | packages/mobile/src/components/LanguageSwitcher.tsx |
| Mobile | Add AsyncStorage persistence for language preference | packages/mobile/package.json, packages/mobile/src/app/_layout.tsx |
| i18n | Verify notes and common namespace keys cover mobile strings | packages/i18n/locales/en/notes.json, packages/i18n/locales/en/common.json |

**Dependencies**: E6-US05

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Mobile notes list renders translated empty state
  Given the user has no notes
  When I view the notes screen
  Then the empty state text comes from translation keys

Scenario: Language switcher changes app language
  Given I am on the notes screen in English
  When I switch the language to French via the switcher
  Then all visible text updates to French

Scenario: Language preference persists across app launches
  Given I switch the language to French
  When I close and reopen the app
  Then the app displays in French

Scenario: Existing Maestro flows pass
  Given all mobile strings are migrated
  When I run the full Maestro E2E suite
  Then all flows pass
```
