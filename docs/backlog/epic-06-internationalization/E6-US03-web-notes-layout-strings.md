# E6-US03: Web Notes & Layout Strings

**User Story**: As a user of the web app, I want notes, navigation, and layout text to be translated so that the entire app experience is in my preferred language.

**Acceptance Criteria**:
- [ ] NoteDrawer (create/edit) uses `t()` for all user-facing strings
- [ ] NoteCard and NoteList widgets use `t()` for all user-facing strings
- [ ] EmptyState text is translated via `t()`
- [ ] Navigation/layout components (header, sidebar, page titles) use `t()`
- [ ] Dashboard page text uses `t()`
- [ ] No hardcoded English strings remain in notes or layout components
- [ ] Notes and common namespace English keys are complete
- [ ] Existing E2E tests pass without modification

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Frontend | Migrate NoteDrawer strings to `t()` | packages/frontend/src/features/notes/ui/NoteDrawer.tsx |
| Frontend | Migrate NoteCard widget strings to `t()` | packages/frontend/src/features/notes/widgets/NoteCard.tsx |
| Frontend | Migrate NoteList widget strings to `t()` | packages/frontend/src/features/notes/widgets/NoteList.tsx |
| Frontend | Migrate layout/navigation strings to `t()` | packages/frontend/src/routes/ |
| Frontend | Migrate empty state and loading strings to `t()` | packages/frontend/src/features/notes/widgets/ |
| i18n | Update notes namespace with all extracted keys | packages/i18n/locales/en/notes.json |
| i18n | Update common namespace with layout/nav keys | packages/i18n/locales/en/common.json |

**Dependencies**: E6-US02

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Notes list renders translated empty state
  Given the user has no notes
  When I view the notes page
  Then the empty state title and description come from translation keys

Scenario: Note drawer renders translated form labels
  Given I open the note create drawer
  When the drawer renders
  Then "Title" and "Content" labels come from translation keys

Scenario: Navigation renders translated links
  Given I am logged in
  When I view the app layout
  Then navigation items (e.g., "Notes", "Logout") come from translation keys

Scenario: Existing E2E tests remain green
  Given all notes and layout strings are migrated
  When I run the full E2E suite
  Then all tests pass
```
