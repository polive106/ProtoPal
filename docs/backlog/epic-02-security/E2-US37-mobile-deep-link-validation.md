# E2-US37: Mobile Deep Link Parameter Validation

**User Story**: As a platform operator, I want deep link parameters in the mobile app to be validated before use so that malicious deep links cannot inject crafted values into API calls or navigation state.

**Acceptance Criteria**:
- [ ] All route parameters received via deep links (e.g., `noteId`) are validated against expected formats (UUID)
- [ ] Invalid deep link parameters result in a redirect to a safe screen (e.g., home/dashboard) rather than a crash or undefined behavior
- [ ] The `protopal://` custom scheme handler validates the target route exists before navigating
- [ ] Deep link parameters are sanitized before being used in API calls
- [ ] A centralized deep link validation utility is created for reuse across routes
- [ ] Unit tests cover valid, invalid, and malicious deep link parameter scenarios

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Mobile | Create deep link parameter validation utility | packages/mobile/src/lib/deepLinkValidation.ts |
| Mobile | Add UUID validation for noteId in notes routes | packages/mobile/app/notes/[noteId].tsx |
| Mobile | Add parameter validation in note form route | packages/mobile/app/notes/form.tsx |
| Mobile | Redirect to dashboard for invalid parameters | packages/mobile/app/notes/[noteId].tsx |
| Mobile | Unit tests for deep link validation | packages/mobile/src/lib/deepLinkValidation.test.ts |

**Dependencies**: E3-US01

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Valid UUID noteId is accepted
  Given a deep link protopal://notes/550e8400-e29b-41d4-a716-446655440000
  When the app handles the deep link
  Then it should navigate to the note detail screen

Scenario: Invalid noteId is rejected
  Given a deep link protopal://notes/<script>alert(1)</script>
  When the app handles the deep link
  Then it should redirect to the dashboard
  And no API call should be made with the invalid ID

Scenario: SQL-injection-style noteId is rejected
  Given a deep link protopal://notes/1' OR '1'='1
  When the app handles the deep link
  Then it should redirect to the dashboard

Scenario: Missing noteId is handled gracefully
  Given a deep link protopal://notes/
  When the app handles the deep link
  Then it should redirect to the notes list
```
