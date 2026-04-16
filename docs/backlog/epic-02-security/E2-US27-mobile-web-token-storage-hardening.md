# E2-US27: Mobile Web Token Storage Hardening

**User Story**: As a security-conscious developer, I want the mobile app's web fallback to use a more secure token storage mechanism than `localStorage` so that authentication tokens are not vulnerable to XSS attacks when the mobile app runs in a browser.

**Acceptance Criteria**:
- [ ] `secureStorage.ts` web fallback uses `sessionStorage` instead of `localStorage` (tokens cleared when tab closes, reducing persistent exposure)
- [ ] Alternatively, if the mobile web experience is not a supported target, a clear warning is logged when `localStorage` is used as a fallback
- [ ] Token is cleared from storage on logout (already implemented, verify it works with updated storage)
- [ ] The `AuthProvider` handles storage failures gracefully (e.g., if storage is full or disabled in privacy mode)
- [ ] A comment documents why `localStorage`/`sessionStorage` is less secure than `expo-secure-store` and links to relevant security guidance

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Mobile | Replace `localStorage` with `sessionStorage` in web fallback or add security warning | packages/mobile/src/lib/secureStorage.ts |
| Mobile | Add error handling for storage failures | packages/mobile/src/lib/secureStorage.ts |
| Mobile | Add security documentation comment | packages/mobile/src/lib/secureStorage.ts |
| Mobile | Unit tests for web fallback behavior | packages/mobile/src/lib/secureStorage.test.ts |

**Dependencies**: None

**Complexity**: XS

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Web fallback uses sessionStorage
  Given the app is running on web platform
  When a token is stored via secureStorage.setItem()
  Then the token should be stored in sessionStorage (not localStorage)

Scenario: Token is cleared on tab close (sessionStorage)
  Given a token is stored in sessionStorage on web
  When the browser tab is closed and reopened
  Then the token should no longer be available

Scenario: Storage failure does not crash the app
  Given sessionStorage is unavailable (private browsing, storage full)
  When the app tries to store a token
  Then the operation should fail gracefully without crashing
  And the user should be redirected to login

Scenario: Native platforms still use expo-secure-store
  Given the app is running on iOS or Android
  When a token is stored via secureStorage.setItem()
  Then expo-secure-store should be used (not sessionStorage)
```
