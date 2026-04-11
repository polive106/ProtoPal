# E8-US03: Mobile Transport Security

**User Story**: As a mobile user, I want all API communication to be encrypted in transit so that my credentials and data cannot be intercepted by network attackers.

**Acceptance Criteria**:
- [ ] The mobile API client defaults to HTTPS in production builds
- [ ] A runtime check warns or blocks if `EXPO_PUBLIC_API_URL` uses `http://` in production
- [ ] Certificate pinning is implemented for production native builds (iOS/Android)
- [ ] Development mode allows HTTP for localhost convenience
- [ ] Documentation explains transport security configuration

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Mobile | Change default API URL to use HTTPS (keep HTTP for dev) | packages/mobile/src/lib/api.ts |
| Mobile | Add runtime validation that rejects HTTP URLs when `__DEV__` is false | packages/mobile/src/lib/api.ts |
| Mobile | Research and implement certificate pinning (e.g., `expo-certificate-transparency` or custom `fetch` interceptor) | packages/mobile/src/lib/api.ts |
| Mobile | Add unit tests for URL validation logic | packages/mobile/src/lib/api.test.ts |
| Docs | Document transport security configuration and certificate pinning setup | docs/ |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Security Context**:
- **Severity**: High
- **File**: `packages/mobile/src/lib/api.ts` (Line 22)
- **Issue**: The default API URL is `http://localhost:3000` with no HTTPS enforcement. In production builds, if `EXPO_PUBLIC_API_URL` is misconfigured or omitted, the app will communicate over unencrypted HTTP. This allows man-in-the-middle attacks that can steal authentication tokens (sent via Bearer header) and user data. Certificate pinning is absent, meaning even HTTPS connections could be intercepted with a compromised or rogue CA certificate.

**Test Scenarios**:
```gherkin
Scenario: Production build rejects HTTP API URL
  Given the app is built in production mode (__DEV__ is false)
  And EXPO_PUBLIC_API_URL is set to "http://api.example.com"
  When the API client initializes
  Then it should throw an error requiring HTTPS

Scenario: Development build allows HTTP
  Given the app is running in development mode (__DEV__ is true)
  And the API URL is "http://localhost:3000"
  When the API client initializes
  Then it should accept the HTTP URL without error

Scenario: HTTPS is used by default in production
  Given the app is built in production mode
  And EXPO_PUBLIC_API_URL is not set
  When the API client initializes
  Then the base URL should use HTTPS
```
