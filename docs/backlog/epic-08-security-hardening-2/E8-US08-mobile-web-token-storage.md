# E8-US08: Mobile Web Token Storage Security

**User Story**: As a mobile web user, I want my authentication tokens stored securely so that they are not vulnerable to XSS attacks when using the app in a browser.

**Acceptance Criteria**:
- [ ] The `secureStorage` web fallback no longer uses `localStorage` for auth tokens
- [ ] On web platform, tokens are handled via httpOnly cookies (same as frontend) or a more secure alternative
- [ ] Native platforms continue using `expo-secure-store` unchanged
- [ ] The mobile auth flow works correctly on both web and native platforms
- [ ] Token retrieval for API requests is transparent to consuming code

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Mobile | Update `secureStorage.ts` web fallback to avoid localStorage for sensitive tokens | packages/mobile/src/lib/secureStorage.ts |
| Mobile | Option A: Switch mobile web to cookie-based auth (align with frontend) | packages/mobile/src/lib/api.ts, packages/mobile/src/providers/AuthProvider.tsx |
| Mobile | Option B: Use `sessionStorage` with shorter lifetime (less ideal but better than localStorage) | packages/mobile/src/lib/secureStorage.ts |
| Mobile | Update AuthProvider to handle platform-specific auth strategies | packages/mobile/src/providers/AuthProvider.tsx |
| Mobile | Unit tests for secure storage on both platforms | packages/mobile/src/lib/secureStorage.test.ts |
| Mobile | Verify auth flow works on web and native | packages/mobile/maestro/flows/ (native), manual web test |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Web platform does not use localStorage for tokens
  Given the app is running on web platform
  When a user logs in
  Then the auth token should NOT be stored in localStorage

Scenario: Native platform uses expo-secure-store
  Given the app is running on iOS or Android
  When a user logs in
  Then the auth token should be stored via expo-secure-store

Scenario: Auth works correctly after storage change on web
  Given the app is running on web platform
  When a user logs in and navigates to protected routes
  Then authenticated requests should include proper credentials
  And the user should remain logged in across page navigations
```
