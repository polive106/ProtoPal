# E2-US23: Mobile Certificate Pinning

**User Story**: As a platform operator, I want the mobile app to pin the server's TLS certificate so that man-in-the-middle attacks using forged or compromised certificates cannot intercept API traffic between the app and backend.

**Acceptance Criteria**:
- [ ] Mobile app validates the server's TLS certificate against a pinned public key hash (SPKI pin)
- [ ] API requests fail with a clear error when the certificate does not match the pin
- [ ] At least two pins are configured: one for the current certificate and one backup pin for rotation
- [ ] Certificate pins are stored in app configuration, not hardcoded in source files
- [ ] Pin validation is active only in production builds (disabled in development for local testing)
- [ ] App displays a user-friendly error screen when certificate validation fails (not a crash)
- [ ] Pin update mechanism documented: how to rotate pins when certificates are renewed
- [ ] Android and iOS native builds both enforce certificate pinning

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Mobile | Install and configure `expo-certificate-pinning` or equivalent library | packages/mobile/package.json |
| Mobile | Create certificate pinning configuration with primary and backup pins | packages/mobile/src/lib/certificatePinning.ts |
| Mobile | Wrap API client fetch calls with pinned fetch | packages/mobile/src/lib/api.ts |
| Mobile | Add environment-based toggle (disable pinning in dev) | packages/mobile/src/lib/certificatePinning.ts |
| Mobile | Add error boundary / fallback screen for pin validation failures | packages/mobile/src/components/CertificateError.tsx |
| Mobile | Document pin extraction and rotation process | packages/mobile/docs/certificate-pinning.md |
| Mobile | Update Expo prebuild config for native pinning support | packages/mobile/app.json |
| E2E | Verify pinning is active in production build (manual test documented) | packages/mobile/maestro/flows/ |

**Dependencies**: E3-US01

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: API request succeeds with valid certificate
  Given the app is running in production mode
  And the server presents a certificate matching the pinned hash
  When I make an API request
  Then the request succeeds normally

Scenario: API request fails with invalid certificate
  Given the app is running in production mode
  And a proxy presents a different certificate (MITM)
  When I make an API request
  Then the request fails with a certificate pinning error
  And the app displays a user-friendly error screen

Scenario: Pinning is disabled in development
  Given the app is running in development mode
  When I make an API request to localhost
  Then the request succeeds without certificate validation

Scenario: Backup pin allows rotation
  Given the primary certificate is being rotated
  And the server presents the new certificate matching the backup pin
  When I make an API request
  Then the request succeeds
```
