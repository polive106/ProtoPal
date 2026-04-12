# E8-US06: Account Lockout DoS Mitigation

**User Story**: As a platform operator, I want account lockout to be resistant to targeted denial-of-service attacks so that malicious actors cannot deliberately lock legitimate users out of their accounts.

**Acceptance Criteria**:
- [ ] IP-based rate limiting is added for failed login attempts (e.g., 20 failures per IP per hour)
- [ ] An IP that exceeds the failure threshold is temporarily blocked from all login attempts
- [ ] Per-email lockout still functions as before (5 failures = progressive lockout)
- [ ] The combination of IP + email lockout prevents both credential stuffing and targeted DoS
- [ ] Legitimate users on shared IPs (e.g., corporate NAT) are not disproportionately affected
- [ ] Admin can view and clear IP-based blocks

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Add IP-based failed login tracking to LoginAttemptRepository port | packages/domain/src/ports/LoginAttemptRepository.ts |
| Domain | Update LoginUser use case to check IP-based limits before account lockout | packages/domain/src/use-cases/LoginUser.ts |
| Database | Add `login_attempts_by_ip` table or extend existing rate limit infrastructure | packages/database/src/schema/schema.sqlite.ts, schema.postgres.ts |
| Database | IP-based login attempt repository adapter | packages/database/src/adapters/drizzle/DrizzleLoginAttemptRepository.ts |
| API | Pass client IP to LoginUser use case | packages/api/src/controllers/auth.controller.ts |
| API | Admin endpoint to view/clear IP blocks | packages/api/src/controllers/admin.controller.ts |
| API | Unit tests for combined IP + email lockout logic | packages/domain/src/use-cases/LoginUser.test.ts |
| E2E | Verify IP-based blocking after threshold | e2e/tests/auth.api.spec.ts |

**Dependencies**: E8-US01 (correct IP required for IP-based limiting)

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: IP blocked after excessive failed logins across different accounts
  Given an IP has made 20 failed login attempts across various emails in the last hour
  When another login attempt is made from the same IP
  Then the response should be 429 Too Many Requests
  And the Retry-After header should indicate when the block expires

Scenario: Per-email lockout still works independently
  Given 5 failed login attempts for user@example.com
  When another login attempt is made for user@example.com
  Then the account should be locked with progressive backoff
  Regardless of how many total IP-based attempts remain

Scenario: Successful login not counted against IP
  Given an IP has made 15 failed login attempts
  When a successful login is made from the same IP
  Then the IP failure counter should not increment
  And the successful user should be logged in

Scenario: Different IPs can still attempt login for locked account
  Given user@example.com is locked due to failures from IP-A
  When a login attempt is made from IP-B with correct credentials
  Then the attempt should be processed (account lock still applies, but IP-B is not blocked)
```
