# E2-US14: Login Timing Attack Mitigation

**User Story**: As a security engineer, I want the login endpoint to have consistent response timing regardless of whether the email exists so that attackers cannot enumerate valid accounts via timing side-channels.

**Acceptance Criteria**:
- [ ] `LoginUser` use-case performs a dummy password hash when the user is not found, matching the time taken by a real bcrypt comparison
- [ ] Response times for valid-email-wrong-password and invalid-email are statistically indistinguishable (within 50ms variance)
- [ ] Failed login attempts for non-existent users still record attempt metadata (already partially done, verify completeness)
- [ ] Unit tests verify that `passwordHasher.verify()` is called even when user is not found
- [ ] No change to existing error messages (must remain "Invalid email or password" for both cases)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Add dummy password hash in `LoginUser.execute()` when `findByEmail` returns null | packages/domain/src/use-cases/LoginUser.ts |
| Domain | Store a pre-computed dummy hash constant for timing consistency | packages/domain/src/use-cases/LoginUser.ts |
| Domain | Add unit test verifying `passwordHasher.verify` is called for non-existent users | packages/domain/src/use-cases/LoginUser.test.ts |
| E2E | Add timing-based test asserting response times are consistent | e2e/tests/auth.api.spec.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Login with non-existent email performs dummy hash
  Given no user exists with email "ghost@example.com"
  When I attempt to login with email "ghost@example.com"
  Then passwordHasher.verify should still be called (dummy comparison)
  And the response should be 401 with "Invalid email or password"

Scenario: Timing consistency between existing and non-existing users
  Given user "user@example.com" exists
  And no user exists with email "ghost@example.com"
  When I measure login response times for both emails with wrong passwords
  Then the response time difference should be less than 50ms on average

Scenario: Failed attempts recorded for non-existent users
  Given no user exists with email "ghost@example.com"
  When I attempt to login with that email 3 times
  Then 3 failed login attempts should be recorded
```
