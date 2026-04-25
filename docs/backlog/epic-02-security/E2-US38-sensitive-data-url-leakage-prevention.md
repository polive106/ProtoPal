# E2-US38: Sensitive Data URL Leakage Prevention

**User Story**: As a platform operator, I want security tokens and email addresses removed from URL query parameters after processing so that sensitive data is not leaked via browser history, referrer headers, or server access logs.

**Acceptance Criteria**:
- [ ] After the `/verify` page processes the verification token from the URL, it replaces the URL with `history.replaceState` to remove the token from the address bar and browser history
- [ ] After the `/reset-password` page processes the reset token, the token is removed from the URL via `history.replaceState`
- [ ] The `/check-email` page receives the email via router state (not URL query params), falling back to a generic message if state is unavailable
- [ ] A `Referrer-Policy: no-referrer` header (or meta tag) is set to prevent token leakage in referrer headers when navigating away from token-bearing pages
- [ ] Registration redirect uses `navigate({ replace: true })` to avoid storing the email in navigation history
- [ ] Frontend API response types no longer include `resetToken` in `ForgotPasswordResponse` (it should never reach the client in production)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Frontend | Add `history.replaceState` after token extraction in verify route | packages/frontend/src/routes/verify.tsx |
| Frontend | Add `history.replaceState` after token extraction in reset-password route | packages/frontend/src/routes/reset-password.tsx |
| Frontend | Refactor check-email to use router state instead of URL params | packages/frontend/src/routes/check-email.tsx |
| Frontend | Update registration redirect to use `replace: true` and pass email via state | packages/frontend/src/features/auth/hooks/useRegistrationForm.ts |
| Frontend | Remove `resetToken` from `ForgotPasswordResponse` interface | packages/frontend/src/features/auth/api.ts |
| Frontend | Add `<meta name="referrer" content="no-referrer">` to verify and reset-password pages | packages/frontend/src/routes/verify.tsx, reset-password.tsx |
| Frontend | Unit tests for URL sanitization behavior | packages/frontend/src/routes/verify.test.tsx |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Token is removed from URL after verification
  Given I navigate to /verify?token=abc123
  When the verification is processed
  Then the browser URL should be /verify (no query params)
  And the browser history should not contain the token

Scenario: Reset token is removed from URL after processing
  Given I navigate to /reset-password?token=xyz789
  When the page loads
  Then the URL should be replaced to /reset-password (no token)

Scenario: Check-email page works without URL params
  Given I complete registration
  When I am redirected to /check-email
  Then the email should be passed via router state
  And the URL should not contain the email address

Scenario: Referrer header does not leak tokens
  Given I am on /verify?token=abc123
  When I click an external link
  Then the Referer header should not contain the token
```
