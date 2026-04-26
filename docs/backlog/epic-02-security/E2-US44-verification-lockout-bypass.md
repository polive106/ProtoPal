# E2-US44: Verification Endpoint Lockout Bypass Prevention

**User Story**: As a platform operator, I want the email verification endpoint to respect account lockout state so that attackers cannot bypass brute-force protections by verifying a locked account's email and gaining access while the account should be inaccessible.

**Acceptance Criteria**:
- [ ] `POST /auth/verify` checks account lockout status before processing the verification token
- [ ] If the account is locked, the verify endpoint returns 429 with a Retry-After header (consistent with login lockout)
- [ ] Failed verification attempts (invalid/expired token) are logged in the audit trail
- [ ] The verification endpoint returns generic error messages that do not reveal whether the token was valid but expired vs. completely invalid
- [ ] Existing E2E tests for verification flow still pass with the new guard

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add lockout status check (via LoginAttemptRepository) to the verify endpoint handler | packages/api/src/controllers/auth.controller.ts |
| API | Return 429 with Retry-After header when account is locked | packages/api/src/controllers/auth.controller.ts |
| API | Normalize error messages for invalid vs. expired verification tokens | packages/api/src/controllers/auth.controller.ts |
| API | Add audit log entries for failed verification attempts | packages/api/src/controllers/auth.controller.ts |
| API | Unit tests for lockout check on verify | packages/api/src/controllers/auth.controller.test.ts |
| E2E | E2E test: locked account cannot verify email | e2e/tests/auth.api.spec.ts |

**Dependencies**: E2-US04, E2-US33

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Locked account cannot verify email
  Given user "locked@example.com" has a locked account (5+ failed logins)
  And the user has a valid verification token
  When I call POST /auth/verify with the token
  Then the response should be 429 Too Many Requests
  And the Retry-After header should indicate when to retry
  And the account should remain unverified

Scenario: Unlocked account can verify normally
  Given user "new@example.com" is not locked
  And the user has a valid verification token
  When I call POST /auth/verify with the token
  Then the response should be 200 OK
  And the account should be marked as verified

Scenario: Failed verification is audited
  Given I have an expired verification token
  When I call POST /auth/verify with the expired token
  Then an audit log entry should record the failed attempt with my IP

Scenario: Error messages do not distinguish expired vs invalid tokens
  Given an expired token and a completely invalid token
  When I call POST /auth/verify with each
  Then both should return the same error message
```
