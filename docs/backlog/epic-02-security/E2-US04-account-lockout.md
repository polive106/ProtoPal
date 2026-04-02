# E2-US04: Account Lockout & Brute Force Protection

**User Story**: As a platform operator, I want accounts to lock after repeated failed login attempts so that brute-force attacks are mitigated even from distributed IPs.

**Acceptance Criteria**:
- [ ] Failed login attempts are tracked per email in the database
- [ ] Account is locked after 5 consecutive failed attempts
- [ ] Lockout duration uses exponential backoff (5min, 15min, 1hr, 4hr, 24hr)
- [ ] Successful login resets the failure counter
- [ ] Locked accounts receive a clear error message with retry-after time
- [ ] Admin can unlock accounts manually
- [ ] Lockout state is visible on the admin dashboard (future)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add `login_attempts` table (id, email, attempts, locked_until, last_attempt_at, created_at) | packages/database/src/schema.sqlite.ts |
| Database | LoginAttemptRepository adapter | packages/database/src/adapters/DrizzleLoginAttemptRepository.ts |
| Domain | LoginAttemptRepository port | packages/domain/src/ports/LoginAttemptRepository.ts |
| Domain | Update LoginUser to check/update lockout state | packages/domain/src/use-cases/LoginUser.ts |
| API | Return 429 with Retry-After header on locked accounts | packages/api/src/controllers/auth.controller.ts |
| API | Admin endpoint to unlock account (future) | packages/api/src/controllers/admin.controller.ts |
| Domain | Unit tests for lockout logic | packages/domain/src/use-cases/LoginUser.test.ts |
| API | Integration tests for lockout flow | packages/api/src/controllers/auth.controller.integration.test.ts |
| E2E | Brute force lockout test | e2e/tests/auth.api.spec.ts |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Account locks after 5 failed attempts
  Given a user with email "user@example.com"
  When I submit 5 incorrect passwords
  Then the 6th attempt should return 429 Too Many Requests
  And the response should include a Retry-After header

Scenario: Successful login resets failure count
  Given a user with 4 failed attempts
  When I log in with the correct password
  Then the failure counter should reset to 0

Scenario: Lockout duration increases exponentially
  Given a user locked out for the 3rd time
  Then the lockout duration should be 1 hour

Scenario: Admin unlocks a locked account
  Given a locked user account
  When an admin calls the unlock endpoint
  Then the user should be able to log in again
```
