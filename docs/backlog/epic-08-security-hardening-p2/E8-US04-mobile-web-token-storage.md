# E8-US04: Mobile Web Token Storage Security

**User Story**: As a security engineer, I want the mobile app's web platform to use a secure token storage mechanism so that authentication tokens are not vulnerable to XSS theft via localStorage.

**Acceptance Criteria**:
- [ ] The web platform fallback in `secureStorage.ts` no longer uses `localStorage` for auth tokens
- [ ] A more secure alternative is implemented (e.g., httpOnly cookie coordination, sessionStorage with tab-scoped lifetime, or in-memory-only with re-auth)
- [ ] Native platforms (iOS/Android) continue using `expo-secure-store` unchanged
- [ ] Token is cleared from storage on logout for all platforms
- [ ] Documentation explains the security trade-offs of the web platform approach

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Mobile | Replace `localStorage` fallback with sessionStorage or in-memory token store | packages/mobile/src/lib/secureStorage.ts |
| Mobile | Add platform-specific security documentation comments | packages/mobile/src/lib/secureStorage.ts |
| Mobile | Ensure logout clears tokens from the chosen storage on all platforms | packages/mobile/src/providers/AuthProvider.tsx |
| Mobile | Add unit tests for web platform storage behavior | packages/mobile/src/lib/secureStorage.test.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Security Context**:
- **Severity**: High
- **File**: `packages/mobile/src/lib/secureStorage.ts` (Lines 10-11, 18)
- **Issue**: When the mobile app runs on web (via Expo Web), the `secureStorage` module falls back to `localStorage` for token storage:
  ```typescript
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  }
  ```
  `localStorage` is accessible to any JavaScript running on the page, including XSS payloads. An XSS vulnerability anywhere in the application would allow an attacker to steal the authentication token. Native `expo-secure-store` uses OS-level encryption (Keychain on iOS, EncryptedSharedPreferences on Android), which is significantly more secure.

**Test Scenarios**:
```gherkin
Scenario: Web platform does not use localStorage for tokens
  Given the app is running on the web platform
  When a token is stored via secureStorage
  Then localStorage should not contain the token

Scenario: Native platform uses SecureStore
  Given the app is running on iOS or Android
  When a token is stored via secureStorage
  Then expo-secure-store should be used

Scenario: Logout clears tokens on all platforms
  Given a user is logged in on any platform
  When they log out
  Then the stored token should be completely removed
```
