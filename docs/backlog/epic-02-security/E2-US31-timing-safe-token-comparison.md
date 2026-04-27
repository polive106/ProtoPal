# E2-US31: Timing-Safe Token Comparison

**User Story**: As a security-conscious developer, I want all security token comparisons (password reset, email verification, token blacklist) to use constant-time comparison so that attackers cannot determine token validity through response timing analysis.

**Acceptance Criteria**:
- [ ] Password reset token hash lookups use `crypto.timingSafeEqual()` for comparison
- [ ] Email verification token hash lookups use `crypto.timingSafeEqual()` for comparison
- [ ] Token blacklist lookups use `crypto.timingSafeEqual()` for comparison
- [ ] All token-related endpoints have consistent response timing regardless of whether the token exists
- [ ] A fixed minimum response delay (e.g., 200ms) is applied to token verification endpoints to normalize timing
- [ ] The `TokenGenerator` port documents the requirement for timing-safe comparison in implementations

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add timing-safe comparison wrapper utility | packages/database/src/adapters/utils/timing-safe.ts |
| Database | Update Drizzle `PasswordResetTokenRepository` to use timing-safe comparison | packages/database/src/adapters/drizzle/DrizzlePasswordResetTokenRepository.ts |
| Database | Update Drizzle `VerificationTokenRepository` to use timing-safe comparison | packages/database/src/adapters/drizzle/DrizzleVerificationTokenRepository.ts |
| Database | Update Drizzle `TokenBlacklistRepository` to use timing-safe comparison | packages/database/src/adapters/drizzle/DrizzleTokenBlacklistRepository.ts |
| Database | Update Mongo equivalents with timing-safe comparison | packages/database/src/adapters/mongo/ |
| Domain | Add JSDoc to `TokenGenerator` port documenting timing-safe requirements | packages/domain/src/ports/TokenGenerator.ts |
| API | Add minimum response delay to token verification endpoints | packages/api/src/controllers/auth.controller.ts |
| Database | Unit tests verifying constant-time behavior | packages/database/src/adapters/utils/timing-safe.test.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Valid token lookup takes the same time as invalid token
  Given a valid password reset token hash exists in the database
  When I look up the valid token hash and an invalid token hash
  Then both lookups should complete within 50ms of each other

Scenario: Token comparison uses crypto.timingSafeEqual
  Given a token hash "abc123" is stored
  When the repository compares against a candidate hash
  Then it should use crypto.timingSafeEqual (not === or ==)

Scenario: Verification endpoint has consistent response timing
  Given the minimum response delay is 200ms
  When I submit a valid verification token
  And I submit an invalid verification token
  Then both responses should take at least 200ms
  And the timing difference should be less than 50ms
```
