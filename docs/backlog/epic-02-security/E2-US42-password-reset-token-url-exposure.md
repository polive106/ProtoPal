# E2-US42: Password Reset Token URL Exposure Prevention

**User Story**: As a security-conscious user, I want the password reset flow to avoid exposing the reset token in the browser URL so that the token cannot be leaked via browser history, referrer headers, or shoulder surfing.

**Acceptance Criteria**:
- [ ] The password reset page reads the token from the URL on mount and immediately removes it from the browser URL (via `history.replaceState`)
- [ ] The token is stored in component state (memory only), not in localStorage or sessionStorage
- [ ] The `Referrer-Policy` header prevents the token from leaking to external sites via HTTP Referer
- [ ] If the page is refreshed after token removal from URL, the user sees a "token expired or invalid" message (not a blank form)
- [ ] Email reset links still use URL tokens (standard pattern), but the frontend cleans up immediately
- [ ] Mobile reset flow uses the same pattern (deep link → extract token → clear URL)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Frontend | On mount, extract `token` from URL search params and call `history.replaceState` to remove it | packages/frontend/src/routes/reset-password.tsx |
| Frontend | Store token in `useState` (not URL or storage) for form submission | packages/frontend/src/features/auth/hooks/useResetPasswordForm.ts |
| Frontend | Show appropriate message if no token is available (refreshed page) | packages/frontend/src/features/auth/widgets/ResetPasswordForm.tsx |
| API | Add `Referrer-Policy: strict-origin-when-cross-origin` to Helmet config (if not already set) | packages/api/src/main.ts |
| Mobile | Extract token from deep link and clear navigation params | packages/mobile/src/features/auth/ |
| Frontend | Unit test: token removed from URL after mount | packages/frontend/src/routes/reset-password.test.tsx |
| E2E | Test password reset flow with token cleanup | e2e/tests/auth/ |

**Dependencies**: E2-US06

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Token is removed from URL after page load
  Given I navigate to /reset-password?token=abc123
  When the page finishes loading
  Then the browser URL should be /reset-password (no query params)
  And the reset form should be displayed with the token in memory

Scenario: Page refresh after token cleanup shows error
  Given I loaded /reset-password?token=abc123 and the token was cleaned from URL
  When I refresh the page
  Then I should see a message indicating the reset link is invalid or expired
  And no password reset form should be displayed

Scenario: Referrer header does not leak token
  Given I am on the reset password page
  When I click an external link (if any)
  Then the Referer header should not contain the token parameter
```
