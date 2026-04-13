# E8-US12: Mobile Certificate Pinning

**User Story**: As a platform operator, I want the mobile app to pin the server's TLS certificate so that man-in-the-middle attacks are prevented even on compromised networks.

**Security Finding**: The mobile app (`packages/mobile/src/lib/api.ts`) uses standard `fetch()` with no certificate pinning. On compromised WiFi networks, corporate networks with SSL inspection, or rooted/jailbroken devices, an attacker could intercept API traffic using a forged or corporate-issued certificate. Certificate pinning ensures the app only communicates with servers presenting the expected certificate.

**Current State**:
- `packages/mobile/src/lib/api.ts` — uses standard `fetch()` with no TLS validation
- No certificate pinning library in dependencies
- Expo environment supports native modules for certificate pinning

**Acceptance Criteria**:
- [ ] Mobile app pins the production API server's certificate (or public key)
- [ ] Pinned certificate/key is bundled with the app or configured at build time
- [ ] Connections to servers with non-matching certificates are rejected
- [ ] A fallback mechanism exists for certificate rotation (pin backup keys)
- [ ] Certificate pinning is disabled in development mode for local testing
- [ ] Documentation explains the certificate rotation process
- [ ] Unit tests verify pinning behavior (mock TLS validation)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Mobile | Evaluate and install certificate pinning library (e.g., `react-native-ssl-pinning` or `expo-certificate-transparency`) | packages/mobile/package.json |
| Mobile | Configure certificate pins for production API | packages/mobile/src/lib/api.ts |
| Mobile | Add development mode bypass for local testing | packages/mobile/src/lib/api.ts |
| Mobile | Bundle backup certificate pins for rotation | packages/mobile/assets/ |
| Mobile | Documentation for certificate rotation process | docs/ |
| Mobile | Unit tests for pinning configuration | packages/mobile/src/lib/api.test.ts |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Valid certificate is accepted
  Given the server presents the pinned certificate
  When the mobile app makes an API request
  Then the request succeeds normally

Scenario: Invalid certificate is rejected
  Given the server presents an unknown certificate
  When the mobile app makes an API request
  Then the request fails with a certificate validation error
  And no data is sent to the server

Scenario: Certificate pinning is disabled in development
  Given NODE_ENV is 'development'
  When the mobile app makes an API request to localhost
  Then certificate pinning is bypassed
```
