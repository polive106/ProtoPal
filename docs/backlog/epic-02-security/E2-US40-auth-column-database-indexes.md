# E2-US40: Auth Column Database Indexes

**User Story**: As a platform operator, I want database indexes on all authentication-critical columns so that auth queries perform efficiently and the system is resilient to denial-of-service via slow query exploitation.

**Acceptance Criteria**:
- [ ] Unique index on `users.email` (queried on every login, registration, and password reset)
- [ ] Unique index on `verification_tokens.token_hash` (queried during email verification)
- [ ] Unique index on `password_reset_tokens.token_hash` (queried during password reset)
- [ ] Index on `login_attempts.email` (queried and updated on every login attempt)
- [ ] Unique index on `token_blacklist.token_hash` (checked on every authenticated request)
- [ ] Index on `token_blacklist.expires_at` (used by cleanup job)
- [ ] Index on `rate_limit_entries.expires_at` (used by cleanup job)
- [ ] Indexes are defined in both SQLite and PostgreSQL schemas
- [ ] MongoDB indexes verified in `mongo-indexes.ts`

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add indexes to SQLite schema for auth-critical columns | packages/database/src/schema/schema.sqlite.ts |
| Database | Add indexes to PostgreSQL schema for auth-critical columns | packages/database/src/schema/schema.postgres.ts |
| Database | Verify MongoDB indexes include email, tokenHash, and expires_at | packages/database/src/setup/mongo-indexes.ts |
| Database | Run `db:push` and verify indexes are applied | packages/database/ |
| API | Benchmark auth endpoint response times before and after (optional) | packages/api/ |

**Dependencies**: E2-US34

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Login query uses email index
  Given the users table has an index on email
  When a login request is processed
  Then the query should use the index (not a full table scan)

Scenario: Token blacklist check is indexed
  Given the token_blacklist table has an index on token_hash
  When an authenticated request checks the blacklist
  Then the lookup should be O(log n) not O(n)

Scenario: Cleanup jobs use expiry indexes
  Given token_blacklist and rate_limit_entries have indexes on expires_at
  When the cleanup job runs
  Then expired entries are found efficiently via index scan
```
