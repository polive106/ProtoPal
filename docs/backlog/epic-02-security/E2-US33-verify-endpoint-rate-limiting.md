# E2-US33: Email Verification Endpoint Rate Limiting

**User Story**: As a platform operator, I want the email verification endpoint to be rate-limited so that attackers cannot brute-force verification tokens by submitting unlimited guesses.

**Acceptance Criteria**:
- [ ] `POST /auth/verify` is rate-limited (e.g., 10 attempts per 15 minutes per IP)
- [ ] Rate limit responses include a `Retry-After` header
- [ ] Failed verification attempts (invalid/expired token) are logged in the audit log
- [ ] After 5 consecutive failed verification submissions from the same IP, a cooldown period is enforced
- [ ] Successful verification is not affected by rate limiting under normal use

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `@RateLimit` decorator to `POST /auth/verify` endpoint | packages/api/src/controllers/auth.controller.ts |
| API | Add audit log entries for failed verification attempts | packages/api/src/controllers/auth.controller.ts |
| API | Add `EMAIL_VERIFICATION_FAILED` to `AuditAction` enum | packages/api/src/services/AuditLogService.ts |
| API | Unit tests for rate limiting on verify endpoint | packages/api/src/controllers/auth.controller.test.ts |
| E2E | Test rate limiting on verification endpoint | e2e/tests/auth.api.spec.ts |

**Dependencies**: E2-US05

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Verify endpoint is rate limited
  Given I submit 11 verification requests in 15 minutes
  When I submit the 11th request
  Then the response should be 429 Too Many Requests
  And the Retry-After header should be present

Scenario: Failed verification is audited
  Given I submit an invalid verification token
  Then the audit log should contain an EMAIL_VERIFICATION_FAILED entry
  And the entry should include the requesting IP address

Scenario: Successful verification works within rate limit
  Given I have a valid verification token
  And I have not exceeded the rate limit
  When I submit the token
  Then my account should be verified successfully
```
