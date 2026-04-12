# E8-US04: PostgreSQL Schema Parity for Security Tables

**User Story**: As a platform operator deploying to production with PostgreSQL, I want all security-related tables to exist in the PostgreSQL schema so that password reset, rate limiting, and account lockout features work correctly in production.

**Acceptance Criteria**:
- [ ] PostgreSQL schema includes `password_reset_tokens` table matching SQLite schema
- [ ] PostgreSQL schema includes `login_attempts` table matching SQLite schema
- [ ] PostgreSQL schema includes `rate_limit_entries` table matching SQLite schema
- [ ] All three tables have correct column types, constraints, and foreign keys for PostgreSQL
- [ ] Drizzle migrations generate cleanly for PostgreSQL
- [ ] Seed script works against PostgreSQL with all tables present

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add `passwordResetTokens` table to PostgreSQL schema | packages/database/src/schema/schema.postgres.ts |
| Database | Add `loginAttempts` table to PostgreSQL schema | packages/database/src/schema/schema.postgres.ts |
| Database | Add `rateLimitEntries` table to PostgreSQL schema | packages/database/src/schema/schema.postgres.ts |
| Database | Update schema barrel export if needed | packages/database/src/schema/index.ts |
| Database | Verify seed script compatibility with PostgreSQL schema | packages/database/src/seed.ts |
| Database | Unit tests verifying both schemas export the same tables | packages/database/src/schema/schema.test.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: PostgreSQL schema includes password_reset_tokens table
  Given the PostgreSQL schema is loaded
  Then the password_reset_tokens table should exist
  And it should have columns: id, user_id, token_hash, expires_at, used_at, created_at

Scenario: PostgreSQL schema includes login_attempts table
  Given the PostgreSQL schema is loaded
  Then the login_attempts table should exist
  And it should have columns: id, email, attempts, lockout_count, locked_until, last_attempt_at, created_at

Scenario: PostgreSQL schema includes rate_limit_entries table
  Given the PostgreSQL schema is loaded
  Then the rate_limit_entries table should exist
  And it should have columns: key, count, window_start, prev_count, prev_window_start, expires_at

Scenario: Schema parity between SQLite and PostgreSQL
  Given both schema files are loaded
  Then every table in SQLite schema should have a corresponding PostgreSQL table
  And column names and constraints should be equivalent
```
