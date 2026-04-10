# E7-US07: Mongo Adapter Unit Tests

**User Story**: As a developer, I want comprehensive unit tests for all MongoDB adapters so that I can confidently maintain and extend them.

**Acceptance Criteria**:
- [ ] Unit tests for all 9 Mongo adapters: User, Note, Role, UserRole, LoginAttempt, VerificationToken, PasswordResetToken, TokenBlacklist, RateLimit
- [ ] Tests use `mongodb-memory-server` for isolated in-memory MongoDB instances
- [ ] Each adapter test covers: create, read (by various keys), update, delete operations
- [ ] Edge cases tested: duplicate key handling, not-found scenarios, expired record cleanup
- [ ] Test patterns match existing Drizzle adapter test conventions
- [ ] All tests pass in CI

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Install `mongodb-memory-server` as dev dependency | packages/database/package.json |
| Database | Create test helper for spinning up in-memory MongoDB | packages/database/src/adapters/mongo/test-helpers.ts |
| Database | Unit tests for `MongoUserRepository` | packages/database/src/adapters/mongo/MongoUserRepository.test.ts |
| Database | Unit tests for `MongoNoteRepository` | packages/database/src/adapters/mongo/MongoNoteRepository.test.ts |
| Database | Unit tests for `MongoRoleRepository` | packages/database/src/adapters/mongo/MongoRoleRepository.test.ts |
| Database | Unit tests for `MongoUserRoleRepository` | packages/database/src/adapters/mongo/MongoUserRoleRepository.test.ts |
| Database | Unit tests for `MongoLoginAttemptRepository` | packages/database/src/adapters/mongo/MongoLoginAttemptRepository.test.ts |
| Database | Unit tests for `MongoVerificationTokenRepository` | packages/database/src/adapters/mongo/MongoVerificationTokenRepository.test.ts |
| Database | Unit tests for `MongoPasswordResetTokenRepository` | packages/database/src/adapters/mongo/MongoPasswordResetTokenRepository.test.ts |
| Database | Unit tests for `MongoTokenBlacklistRepository` | packages/database/src/adapters/mongo/MongoTokenBlacklistRepository.test.ts |
| Database | Unit tests for `MongoRateLimitRepository` | packages/database/src/adapters/mongo/MongoRateLimitRepository.test.ts |

**Dependencies**: E7-US06

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: MongoUserRepository CRUD operations
  Given an in-memory MongoDB instance
  When I create, read, update, and delete a user
  Then all operations succeed and return expected data

Scenario: MongoNoteRepository scoped queries
  Given notes belonging to different users
  When I query findByUserId for a specific user
  Then only that user's notes are returned

Scenario: Duplicate email rejected
  Given a user with email "test@example.com" exists
  When I attempt to create another user with the same email
  Then a duplicate key error is thrown

Scenario: Expired token cleanup
  Given verification tokens with past expiration dates
  When I call deleteExpired()
  Then expired tokens are removed and valid tokens remain

Scenario: Rate limit counter accuracy
  Given a fresh rate limit key
  When I increment it 5 times
  Then get() returns a count of 5
  And after reset() get() returns 0 or null
```
