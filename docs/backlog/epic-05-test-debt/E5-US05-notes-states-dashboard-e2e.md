# E5-US05: Notes List States, Dashboard & Layout E2E Tests

**User Story**: As a developer, I want comprehensive UI E2E tests for notes list states, the dashboard page, and the authenticated layout so that loading, error, and empty states are verified to display correctly to users.

**Acceptance Criteria**:
- [x] E2E test verifies notes list empty state renders when user has no notes
- [x] E2E test verifies "Create Note" button in empty state opens the note drawer
- [x] E2E test verifies notes list loading spinner appears while fetching notes
- [x] E2E test verifies notes list error alert appears when API returns an error
- [x] E2E test verifies dashboard page displays welcome message with user's first name
- [x] E2E test verifies dashboard "View Notes" link navigates to /notes
- [x] E2E test verifies app header displays user's full name
- [x] E2E test verifies "Notes" nav link navigates to /notes
- [x] E2E test verifies "Home" nav link navigates to /dashboard
- [x] All new tests use data-testid selectors from the fixtures

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Design System | Add data-testid prop support to PageSpinner | packages/design-system/src/PageSpinner.tsx |
| Design System | Add data-testid prop support to EmptyState | packages/design-system/src/EmptyState.tsx |
| Frontend | Add data-testid to NoteList loading, error, and empty states | packages/frontend/src/features/notes/widgets/NoteList.tsx |
| E2E | Add loading and empty testIds to notes fixtures | e2e/fixtures/index.ts |
| E2E | Write notes list states E2E test suite | e2e/tests/notes/list-states.spec.ts |
| E2E | Write dashboard and layout E2E test suite | e2e/tests/dashboard/dashboard.spec.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: Fresh user sees empty state on notes page
  Given I am logged in as a user with no notes
  When I navigate to /notes
  Then I should see the empty state with "No notes yet" message
  And I should see a "Create Note" button in the empty state

Scenario: Empty state Create Note button opens drawer
  Given I see the notes empty state
  When I click the "Create Note" button in the empty state
  Then the note drawer should open

Scenario: Notes list shows loading spinner while fetching
  Given the notes API response is delayed
  When I navigate to /notes
  Then I should see a loading spinner
  And the spinner should disappear when data loads

Scenario: Notes list shows error alert on API failure
  Given the notes API returns a 500 error
  When I navigate to /notes
  Then I should see an error alert with an error message

Scenario: Dashboard shows welcome message with user name
  Given I am logged in
  When I am on the dashboard page
  Then I should see "Welcome, {firstName}!" in the title

Scenario: Dashboard notes link navigates to notes page
  Given I am on the dashboard page
  When I click the "View Notes" link
  Then I should be navigated to /notes

Scenario: App header displays user full name
  Given I am logged in
  When I am on any authenticated page
  Then the header should display my first and last name

Scenario: Nav links navigate correctly
  Given I am logged in
  When I click the "Notes" nav link
  Then I should be navigated to /notes
  When I click the "Home" nav link
  Then I should be navigated to /dashboard
```
