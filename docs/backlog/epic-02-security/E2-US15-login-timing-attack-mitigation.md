# E2-US15: Login Timing Attack Mitigation

**User Story**: As a security-conscious operator, I want login responses to take constant time regardless of whether the email exists so that attackers cannot enumerate valid accounts via response timing analysis.

**Acceptance Criteria**:
- [ ] `LoginUser` use-case performs a password hash operation even when the user is not found (constant-time path)
- [ ] Response time for non-existent email is indistinguishable from wrong-password for existing email
- [ ] Existing user enumeration prevention tests still pass (E2-US09)
- [ ] Unit test verifies `passwordHasher.hash()` is called when user is not found
- [ ] Error messages remain identical for both cases ("Invalid email or password")

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Add dummy `passwordHasher.hash()` call in `LoginUser.execute()` when user is not found | packages/domain/src/use-cases/LoginUser.ts:79-81 |
| Domain | Add unit test verifying hash is called for non-existent users | packages/domain/src/use-cases/LoginUser.test.ts |
| Domain | Add unit test measuring that both paths call hash exactly once | packages/domain/src/use-cases/LoginUser.test.ts |

**Dependencies**: E2-US09 (User Enumeration Prevention — Done)

**Complexity**: XS

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Non-existent email triggers dummy hash
  Given user "unknown@example.com" does not exist
  When I attempt to login with "unknown@example.com"
  Then passwordHasher.hash() should be called once
  And the error message should be "Invalid email or password"

Scenario: Wrong password for existing user also hashes
  Given user "known@example.com" exists with password "correctpass"
  When I attempt to login with password "wrongpass"
  Then passwordHasher.verify() should be called
  And the error message should be "Invalid email or password"

Scenario: Both paths take similar time
  Given user "known@example.com" exists
  And user "unknown@example.com" does not exist
  When I login with each using wrong credentials
  Then both code paths should invoke a hash/verify operation
```
