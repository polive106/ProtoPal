# E2-US34: Mobile Production HTTPS Enforcement

**User Story**: As a platform operator, I want the mobile app to enforce HTTPS for API communication in production builds so that credentials and auth tokens cannot be intercepted over plain HTTP.

**Acceptance Criteria**:
- [ ] Production builds throw a startup error if `EXPO_PUBLIC_API_URL` is not set
- [ ] Production builds throw a startup error if `EXPO_PUBLIC_API_URL` does not use `https://`
- [ ] Development builds allow `http://` URLs (for localhost testing)
- [ ] The localhost fallback (`http://localhost:3000`) is only used when `__DEV__` is true
- [ ] A clear error message is shown if the API URL is misconfigured in production
- [ ] Android `network_security_config.xml` restricts cleartext traffic to localhost only (dev) or disables it entirely (prod)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Mobile | Add production URL validation in api.ts | packages/mobile/src/lib/api.ts |
| Mobile | Remove localhost fallback for non-dev builds | packages/mobile/src/lib/api.ts |
| Mobile | Add Android network security config to restrict cleartext | packages/mobile/android/app/src/main/res/xml/network_security_config.xml |
| Mobile | Update app.json to reference network security config | packages/mobile/app.json |
| Mobile | Unit tests for URL validation logic | packages/mobile/src/lib/api.test.ts |

**Dependencies**: E3-US01

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Production build rejects HTTP API URL
  Given __DEV__ is false
  And EXPO_PUBLIC_API_URL is "http://api.example.com"
  When the app initializes
  Then it should throw an error about HTTPS requirement

Scenario: Production build requires API URL to be set
  Given __DEV__ is false
  And EXPO_PUBLIC_API_URL is not set
  When the app initializes
  Then it should throw an error about missing API URL

Scenario: Development build allows HTTP localhost
  Given __DEV__ is true
  And EXPO_PUBLIC_API_URL is not set
  When the app initializes
  Then it should use http://localhost:3000 as the default

Scenario: Production build with HTTPS URL works
  Given __DEV__ is false
  And EXPO_PUBLIC_API_URL is "https://api.example.com"
  When the app initializes
  Then the API client should be configured correctly
```
