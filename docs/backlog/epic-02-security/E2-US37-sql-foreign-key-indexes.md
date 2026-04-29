# E2-US37: SQL Foreign Key and Query Performance Indexes

**User Story**: As a platform operator, I want all foreign key columns and frequently queried columns in the SQL schema to have database indexes so that lookups, joins, and cascade deletes perform efficiently under load.

**Acceptance Criteria**:
- [ ] Index on `notes.user_id` in both SQLite and Postgres schemas
- [ ] Index on `user_roles.user_id` in both schemas
- [ ] Index on `verification_tokens.user_id` in both schemas
- [ ] Index on `password_reset_tokens.user_id` in both schemas
- [ ] Index on `token_blacklist.expires_at` for efficient cleanup queries
- [ ] Index on `rate_limit_entries.key` for rate limit lookups
- [ ] Index on `rate_limit_entries.expires_at` for cleanup queries
- [ ] All new indexes are tested by verifying query plans do not show full table scans on indexed columns

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add index on `notes.user_id` | packages/database/src/schema/schema.sqlite.ts, schema.postgres.ts |
| Database | Add index on `user_roles.user_id` | packages/database/src/schema/schema.sqlite.ts, schema.postgres.ts |
| Database | Add index on `verification_tokens.user_id` | packages/database/src/schema/schema.sqlite.ts, schema.postgres.ts |
| Database | Add index on `password_reset_tokens.user_id` | packages/database/src/schema/schema.sqlite.ts, schema.postgres.ts |
| Database | Add index on `token_blacklist.expires_at` | packages/database/src/schema/schema.sqlite.ts, schema.postgres.ts |
| Database | Add index on `rate_limit_entries.key` | packages/database/src/schema/schema.sqlite.ts, schema.postgres.ts |
| Database | Add index on `rate_limit_entries.expires_at` | packages/database/src/schema/schema.sqlite.ts, schema.postgres.ts |
| Database | Run `db:push` and verify indexes are created | packages/database/ |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Notes lookup by user_id uses index
  Given the notes table has an index on user_id
  When listing notes for a specific user
  Then the query does not perform a full table scan

Scenario: Token cleanup uses expires_at index
  Given the token_blacklist table has an index on expires_at
  When the cleanup job deletes expired tokens
  Then the query uses the index for efficient deletion

Scenario: Rate limit lookup uses key index
  Given the rate_limit_entries table has an index on key
  When checking rate limits for a specific key
  Then the query uses the index
```
