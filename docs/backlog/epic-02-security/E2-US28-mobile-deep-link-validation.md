# E2-US28: Mobile Deep Link Validation

**User Story**: As a mobile user, I want the app to validate deep link sources and sanitize parameters so that malicious apps cannot exploit the `protopal://` scheme to phish me or navigate me to unintended screens.

**Acceptance Criteria**:
- [ ] Deep link parameters are validated and sanitized before use in navigation
- [ ] Only whitelisted routes are accessible via deep links (auth screens, note detail)
- [ ] Deep links with unknown or malformed paths are rejected gracefully (redirect to home)
- [ ] Deep link tokens (e.g., password reset, email verification) are validated against expected format before submission
- [ ] No sensitive data (tokens, credentials) is accepted via deep link query parameters in production
- [ ] Deep link handling logs navigation attempts for audit purposes (non-sensitive data only)
- [ ] User is shown a confirmation screen before acting on deep links that trigger state changes (e.g., password reset)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Mobile | Create deep link validation utility with route whitelist and parameter sanitization | `packages/mobile/src/lib/deepLinkValidator.ts` |
| Mobile | Add deep link route configuration mapping allowed schemes to internal routes | `packages/mobile/src/lib/deepLinkConfig.ts` |
| Mobile | Integrate validation into Expo Router linking configuration | `packages/mobile/app/_layout.tsx` |
| Mobile | Add confirmation screen for state-changing deep link actions | `packages/mobile/src/features/auth/ui/DeepLinkConfirmation.tsx` |
| Test | Unit tests for deep link validation and sanitization | `packages/mobile/src/lib/deepLinkValidator.test.ts` |
| E2E | Maestro flow testing deep link navigation | `packages/mobile/maestro/flows/deep-link-validation.yaml` |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Valid deep link navigates to correct screen
  Given the app is installed
  When I open deep link protopal://notes/abc123
  Then the app navigates to the note detail screen for abc123

Scenario: Malformed deep link is rejected
  Given the app is installed
  When I open deep link protopal://admin/delete-all
  Then the app redirects to the home screen
  And no admin action is performed

Scenario: Deep link with suspicious parameters is sanitized
  Given the app is installed
  When I open deep link protopal://login?redirect=https://evil.com
  Then the redirect parameter is ignored
  And the app navigates to the login screen normally

Scenario: Password reset deep link shows confirmation
  Given the app is installed
  When I open deep link protopal://reset-password?token=abc123
  Then the app shows a confirmation screen before proceeding
```
