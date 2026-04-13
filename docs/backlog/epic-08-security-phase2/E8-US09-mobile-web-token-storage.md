# E8-US09: Mobile Web Token Storage Hardening

**User Story**: As a platform operator, I want auth tokens on the mobile web fallback to be stored securely so that they are not accessible via XSS attacks.

**Security Finding**: The `secureStorage` utility in `packages/mobile/src/lib/secureStorage.ts` falls back to `localStorage` when running on the web platform (lines 10-11). `localStorage` is accessible to any JavaScript running on the page, making auth tokens vulnerable to XSS attacks. While `expo-secure-store` is properly used on native iOS/Android, the web fallback completely bypasses secure storage.

**Current State**:
- `packages/mobile/src/lib/secureStorage.ts` lines 10-11: `if (Platform.OS === 'web') return localStorage.getItem(key)`
- Auth token is stored via `secureStorage.setItem(TOKEN_KEY, response.token)` in `AuthProvider.tsx` line 55
- The mobile web platform uses bearer tokens (not httpOnly cookies)

**Acceptance Criteria**:
- [ ] Mobile web platform uses httpOnly cookies for authentication instead of localStorage token storage (matching the web frontend approach)
- [ ] OR if bearer tokens are required: tokens are stored in a sessionStorage with a short expiry and encrypted before storage
- [ ] The `secureStorage` web fallback warns in development that storage is not secure
- [ ] `localStorage.getItem('auth_token')` no longer returns a usable token in the mobile web context
- [ ] Unit tests verify the secure storage behavior per platform
- [ ] Authentication flow works correctly on all three platforms (iOS, Android, web)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Mobile | Update secureStorage web fallback to use httpOnly cookie approach or encrypted sessionStorage | packages/mobile/src/lib/secureStorage.ts |
| Mobile | Update AuthProvider to handle cookie-based auth on web | packages/mobile/src/providers/AuthProvider.tsx |
| Mobile | Update api.ts to use credentials: 'include' on web instead of bearer tokens | packages/mobile/src/lib/api.ts |
| Mobile | Unit tests for platform-specific storage behavior | packages/mobile/src/lib/secureStorage.test.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Mobile web does not store tokens in localStorage
  Given the platform is web
  When the user logs in
  Then the auth token should NOT be stored in localStorage
  And authentication should work via httpOnly cookies or encrypted storage

Scenario: Native platforms use expo-secure-store
  Given the platform is iOS or Android
  When the user logs in
  Then the token is stored via expo-secure-store
  And the token is not accessible to JavaScript
```
