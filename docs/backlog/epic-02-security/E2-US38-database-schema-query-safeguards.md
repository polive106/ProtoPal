# E2-US38: Database Schema & Query Safeguards

**User Story**: As a security engineer, I want database queries to have safeguards against resource exhaustion and data integrity gaps so that unbounded queries cannot cause denial of service and schema constraints enforce data consistency.

**Acceptance Criteria**:
- [ ] `UserRepository.findAll()` and `RoleRepository.findAll()` accept pagination parameters (limit/offset) with a maximum limit (e.g., 100)
- [ ] The `findAll()` port interface is updated to include optional pagination parameters
- [ ] Both Drizzle and Mongo adapter implementations enforce the pagination limit
- [ ] The seed script production guard uses an allowlist pattern (`NODE_ENV === 'development' || NODE_ENV === 'test'`) instead of a blocklist (`NODE_ENV !== 'production'`)
- [ ] MongoDB `verification_tokens` collection has a unique index on `tokenHash`
- [ ] MongoDB `password_reset_tokens` collection has a unique index on `tokenHash`
- [ ] Unit tests verify pagination defaults and limits in repository implementations

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Add optional `PaginationOptions` type to repository port interfaces | packages/domain/src/ports/UserRepository.ts, packages/domain/src/ports/RoleRepository.ts |
| Database | Update `DrizzleUserRepository.findAll()` with pagination and max limit | packages/database/src/adapters/drizzle/DrizzleUserRepository.ts |
| Database | Update `DrizzleRoleRepository.findAll()` with pagination and max limit | packages/database/src/adapters/drizzle/DrizzleRoleRepository.ts |
| Database | Update `MongoUserRepository.findAll()` with pagination and max limit | packages/database/src/adapters/mongo/MongoUserRepository.ts |
| Database | Update `MongoRoleRepository.findAll()` with pagination and max limit | packages/database/src/adapters/mongo/MongoRoleRepository.ts |
| Database | Add unique index on `tokenHash` for `verification_tokens` in MongoDB | packages/database/src/setup/mongo-indexes.ts |
| Database | Add unique index on `tokenHash` for `password_reset_tokens` in MongoDB | packages/database/src/setup/mongo-indexes.ts |
| Database | Change seed guard to allowlist pattern | packages/database/src/seed.ts |
| Database | Unit tests for pagination behavior | packages/database/src/adapters/drizzle/DrizzleUserRepository.test.ts, packages/database/src/adapters/mongo/MongoUserRepository.test.ts |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: findAll returns paginated results
  Given 150 users exist in the database
  When I call findAll() with no parameters
  Then it should return at most 100 users (the default max limit)

Scenario: findAll respects custom limit
  Given 50 users exist in the database
  When I call findAll({ limit: 10, offset: 0 })
  Then it should return exactly 10 users

Scenario: findAll rejects limit above maximum
  Given a request for findAll({ limit: 500 })
  When the repository processes the request
  Then the limit should be capped at 100

Scenario: Seed script refuses to run without explicit environment
  Given NODE_ENV is not set
  When the seed script is executed
  Then it should exit with an error message about unsupported environment

Scenario: MongoDB tokenHash index prevents duplicate tokens
  Given a verification token with hash "abc123" exists
  When another token with the same hash is inserted
  Then MongoDB should reject the insert with a duplicate key error
```
