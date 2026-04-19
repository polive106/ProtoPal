# E2-US25: Mobile Token Storage Hardening

**User Story**: As a platform operator, I want the mobile app's web fallback for token storage to use a secure mechanism instead of localStorage so that tokens are not exposed to XSS attacks when the app runs in a browser context.

**Acceptance Criteria**:
- [ ] Web fallback in `secureStorage.ts` no longer uses `localStorage` for auth tokens
- [ ] Web fallback uses `sessionStorage` (cleared on tab close) or in-memory storage as a minimum
- [ ] If `sessionStorage` is used, tokens are automatically cleared when the browser tab is closed
- [ ] Native platforms (iOS/Android) continue to use `expo-secure-store` unchanged
- [ ] Token retrieval on app launch works correctly on all platforms (native + web)
- [ ] Web fallback is clearly documented as less secure than native secure store
- [ ] No regression in login/logout flow on any platform

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Mobile | Replace `localStorage` with `sessionStorage` or in-memory store in web fallback | packages/mobile/src/lib/secureStorage.ts |
| Mobile | Add platform detection comments explaining security trade-offs | packages/mobile/src/lib/secureStorage.ts |
| Mobile | Verify AuthProvider token restoration works on all platforms | packages/mobile/src/providers/AuthProvider.tsx |
| Mobile | Unit tests for secure storage across platforms | packages/mobile/src/lib/secureStorage.test.ts |

**Dependencies**: E3-US02

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Web fallback does not use localStorage
  Given the mobile app is running in a web browser
  When I log in and a token is stored
  Then the token is NOT present in localStorage
  And the token is stored in sessionStorage or memory

Scenario: Token is cleared on tab close (sessionStorage)
  Given I am logged in on the web version
  When I close the browser tab and reopen the app
  Then I am not authenticated (token was cleared)

Scenario: Native platforms use secure store
  Given the mobile app is running on iOS or Android
  When I log in and a token is stored
  Then the token is stored via expo-secure-store

Scenario: Login/logout flow works on web fallback
  Given the mobile app is running in a web browser
  When I log in and then log out
  Then the token is properly cleared from storage
```
