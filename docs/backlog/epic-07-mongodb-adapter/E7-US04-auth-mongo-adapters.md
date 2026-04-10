# E7-US04: Auth Mongo Adapters

**User Story**: As a developer, I want MongoDB implementations of the auth-related repository interfaces so that security features (login tracking, token management, rate limiting, audit logging) work with MongoDB.

**Acceptance Criteria**:
- [ ] `MongoLoginAttemptRepository` implements `LoginAttemptRepository` port interface
- [ ] `MongoVerificationTokenRepository` implements `VerificationTokenRepository` port interface
- [ ] `MongoPasswordResetTokenRepository` implements `PasswordResetTokenRepository` port interface
- [ ] `MongoTokenBlacklistRepository` implements `TokenBlacklistRepository` port interface
- [ ] `MongoRateLimitRepository` implements `RateLimitRepository` port interface
- [ ] All adapters use the official `mongodb` driver (not Mongoose)
- [ ] Data modeled as flat collections with references (no embedded documents)
- [ ] TTL-based expiration handled via MongoDB TTL indexes where applicable

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Implement `MongoLoginAttemptRepository` (record, findRecent, countRecent, deleteByUserId) | packages/database/src/adapters/mongo/MongoLoginAttemptRepository.ts |
| Database | Implement `MongoVerificationTokenRepository` (create, findByToken, findByUserId, delete, deleteExpired) | packages/database/src/adapters/mongo/MongoVerificationTokenRepository.ts |
| Database | Implement `MongoPasswordResetTokenRepository` (create, findByToken, findByUserId, delete, deleteExpired) | packages/database/src/adapters/mongo/MongoPasswordResetTokenRepository.ts |
| Database | Implement `MongoTokenBlacklistRepository` (add, isBlacklisted, deleteExpired) | packages/database/src/adapters/mongo/MongoTokenBlacklistRepository.ts |
| Database | Implement `MongoRateLimitRepository` (increment, get, reset, deleteExpired) | packages/database/src/adapters/mongo/MongoRateLimitRepository.ts |
| Database | Update `src/adapters/mongo/index.ts` barrel with new exports | packages/database/src/adapters/mongo/index.ts |

**Dependencies**: E7-US02

**Complexity**: M

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: Record and count login attempts via MongoDB
  Given a MongoLoginAttemptRepository connected to a test database
  When I record 3 failed login attempts for user "user-1"
  Then countRecent("user-1", 15 minutes) returns 3

Scenario: Create and verify a verification token via MongoDB
  Given a MongoVerificationTokenRepository connected to a test database
  When I create a verification token for user "user-1"
  Then findByToken with the generated token returns the record
  And the record references user "user-1"

Scenario: Blacklist and check a token via MongoDB
  Given a MongoTokenBlacklistRepository connected to a test database
  When I add token hash "abc123" to the blacklist
  Then isBlacklisted("abc123") returns true
  And isBlacklisted("xyz789") returns false

Scenario: Rate limit increment and retrieval via MongoDB
  Given a MongoRateLimitRepository connected to a test database
  When I increment the rate limit key "login:192.168.1.1" three times
  Then get("login:192.168.1.1") returns a count of 3

Scenario: Delete expired password reset tokens via MongoDB
  Given a MongoPasswordResetTokenRepository with an expired token
  When I call deleteExpired()
  Then the expired token is removed
  And non-expired tokens remain
```
