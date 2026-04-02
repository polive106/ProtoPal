# E3-US03: Mobile Notes CRUD & Agent Tooling

**User Story**: As a developer, I want the mobile app to include Notes CRUD and updated agent skills so that agents can implement full-stack features including mobile.

**Acceptance Criteria**:
- [ ] Notes list screen displaying user's notes
- [ ] Note detail screen with full content
- [ ] Create note screen with title and content fields
- [ ] Edit note screen with pre-filled fields
- [ ] Delete note with confirmation
- [ ] Notes scoped to authenticated user
- [ ] Additional design-system-mobile components as needed (Sheet/Dialog, EmptyState, Skeleton)
- [ ] Maestro E2E flows for full notes CRUD
- [ ] AGENTS.md updated with mobile layer in architecture rules, implementation order, and testing mandates
- [ ] Skills updated: `implement-story`, `scaffold`, `add-e2e-tests`, `add-unit-tests`, `create-story` include mobile layer
- [ ] `testID` props on all interactive elements following `{screen}-{element-type}-{name}` convention

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Design System Mobile | Add Sheet/Dialog component | `packages/design-system-mobile/src/components/Sheet.tsx` |
| Design System Mobile | Add EmptyState, Skeleton components | `packages/design-system-mobile/src/components/` |
| Mobile | Create notes API module (list, get, create, update, delete) | `packages/mobile/src/features/notes/api.ts` |
| Mobile | Create notes Zod schemas | `packages/mobile/src/features/notes/schemas.ts` |
| Mobile | Create notes hooks (useNotes, useNote, useCreateNote, useUpdateNote, useDeleteNote) | `packages/mobile/src/features/notes/hooks/` |
| Mobile | Create NoteCard widget | `packages/mobile/src/features/notes/widgets/NoteCard.tsx` |
| Mobile | Create NoteList widget | `packages/mobile/src/features/notes/widgets/NoteList.tsx` |
| Mobile | Create NoteForm UI component | `packages/mobile/src/features/notes/ui/NoteForm.tsx` |
| Mobile | Create notes list screen | `packages/mobile/app/(authenticated)/notes/index.tsx` |
| Mobile | Create note detail screen | `packages/mobile/app/(authenticated)/notes/[noteId].tsx` |
| Mobile | Create note create/edit screen | `packages/mobile/app/(authenticated)/notes/form.tsx` |
| Mobile | Unit tests for notes hooks | `packages/mobile/src/features/notes/hooks/*.test.ts` |
| Mobile | Widget tests for NoteCard, NoteList | `packages/mobile/src/features/notes/widgets/*.test.tsx` |
| E2E Mobile | Notes list flow | `maestro/notes/list.yaml` |
| E2E Mobile | Create note flow | `maestro/notes/create.yaml` |
| E2E Mobile | Edit note flow | `maestro/notes/edit.yaml` |
| E2E Mobile | Delete note flow | `maestro/notes/delete.yaml` |
| Agent Tooling | Update AGENTS.md with mobile layer | `AGENTS.md` |
| Agent Tooling | Update implement-story skill with mobile step | `.agents/skills/implement-story/SKILL.md` |
| Agent Tooling | Update scaffold skill with mobile templates | `.agents/skills/scaffold/SKILL.md` |
| Agent Tooling | Update add-e2e-tests skill with Maestro patterns | `.agents/skills/add-e2e-tests/SKILL.md` |
| Agent Tooling | Update add-unit-tests skill with RN test patterns | `.agents/skills/add-unit-tests/SKILL.md` |
| Agent Tooling | Update create-story skill with mobile layer in template | `.agents/skills/create-story/SKILL.md` |

**Dependencies**: E3-US02

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: View notes list
  Given I am logged in on the mobile app
  And I have existing notes
  When I navigate to the notes screen
  Then I should see a list of my notes

Scenario: Create a note
  Given I am logged in on the mobile app
  And I am on the notes screen
  When I tap "New Note"
  And I fill in title and content
  And I tap "Create"
  Then the note should appear in the list

Scenario: Edit a note
  Given I am logged in on the mobile app
  And I have an existing note
  When I tap on the note
  And I tap "Edit"
  And I update the title
  And I tap "Save"
  Then the note should show the updated title

Scenario: Delete a note
  Given I am logged in on the mobile app
  And I have an existing note
  When I tap "Delete" on the note
  And I confirm the deletion
  Then the note should be removed from the list

Scenario: Empty notes state
  Given I am logged in on the mobile app
  And I have no notes
  When I navigate to the notes screen
  Then I should see an empty state message
```
