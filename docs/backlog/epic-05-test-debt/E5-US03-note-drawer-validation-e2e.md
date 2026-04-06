# E5-US03: Note Drawer Validation & Edit Flow E2E Tests

**User Story**: As a developer, I want comprehensive UI E2E tests for the note drawer so that validation errors, edit flows, and form states are verified end-to-end.

**Acceptance Criteria**:
- [ ] E2E test verifies "Title is required" inline error on empty blur
- [ ] E2E test verifies "Content is required" inline error on empty blur
- [ ] E2E test verifies title at exactly 255 chars succeeds (positive boundary)
- [ ] E2E test verifies content at exactly 50,000 chars succeeds (positive boundary)
- [ ] E2E test verifies cancel button closes drawer without saving
- [ ] E2E test verifies edit flow: open existing note → form pre-fills → update → drawer closes
- [ ] E2E test verifies drawer shows "Edit Note" title and "Update" button in edit mode
- [ ] E2E test verifies "Saving..." button text during creation
- [ ] E2E test verifies delete note flow from list

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| E2E | Write note drawer validation and edit flow E2E tests | e2e/tests/notes/form-validation.spec.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Empty title shows required error
  Given I have opened the note creation drawer
  When I click the title field and blur without typing
  Then I should see "Title is required" below the title input

Scenario: Empty content shows required error
  Given I have opened the note creation drawer
  When I click the content field and blur without typing
  Then I should see "Content is required" below the content input

Scenario: Title at exactly 255 chars is accepted
  Given I have opened the note creation drawer
  When I type exactly 255 characters in the title field
  And I fill in valid content and submit
  Then the note should be created successfully

Scenario: Cancel closes drawer without saving
  Given I have opened the note creation drawer
  And I have typed a title and content
  When I click the cancel button
  Then the drawer should close
  And no new note should appear in the list

Scenario: Edit existing note
  Given I have created a note with title "Original"
  When I click the edit button on that note
  Then the drawer should open with title "Edit Note"
  And the title field should contain "Original"
  When I change the title to "Updated" and click save
  Then the drawer should close
  And the note should show "Updated" in the list

Scenario: Delete note from list
  Given I have created a note
  When I click the delete button on that note
  Then the note should no longer appear in the list
```
