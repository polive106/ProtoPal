# E2-US36: Postgres Schema Parity for Security Tables

**User Story**: As a platform operator deploying to PostgreSQL, I want all security-related tables to exist in the Postgres schema so that password reset, rate limiting, login attempt tracking, and token blacklisting work correctly in production PostgreSQL deployments.

**Acceptance Criteria**:
- [ ] `passwordResetTokens` table exists in Postgres schema with matching columns to SQLite
- [ ] `rateLimitEntries` table exists in Postgres schema with matching columns to SQLite
- [ ] `loginAttempts` table exists in Postgres schema with matching columns to SQLite
- [ ] `tokenBlacklist` table exists in Postgres schema with matching columns to SQLite
- [ ] All foreign key constraints and indexes mirror the SQLite schema
- [ ] Drizzle adapters work interchangeably with both SQLite and Postgres schemas
- [ ] Composite unique constraint on `user_roles(userId, roleId)` exists in both SQLite and Postgres schemas
- [ ] Seed script supports Postgres schema

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add `passwordResetTokens` table to Postgres schema | packages/database/src/schema/schema.postgres.ts |
| Database | Add `rateLimitEntries` table to Postgres schema | packages/database/src/schema/schema.postgres.ts |
| Database | Add `loginAttempts` table to Postgres schema | packages/database/src/schema/schema.postgres.ts |
| Database | Add `tokenBlacklist` table to Postgres schema | packages/database/src/schema/schema.postgres.ts |
| Database | Add composite unique constraint on `user_roles(userId, roleId)` in SQLite and Postgres | packages/database/src/schema/schema.sqlite.ts, schema.postgres.ts |
| Database | Verify Drizzle adapters function correctly with Postgres schema | packages/database/src/adapters/drizzle/ |
| Database | Update seed script for Postgres compatibility | packages/database/src/seed.ts |
| Database | Integration tests with Postgres schema | packages/database/src/ |

**Dependencies**: E7-US01

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Password reset works on Postgres
  Given the application is running with Postgres
  When a user requests a password reset
  Then the token is stored in the passwordResetTokens table
  And the reset flow completes successfully

Scenario: Rate limiting works on Postgres
  Given the application is running with Postgres
  When rate limit entries are created
  Then they are stored in the rateLimitEntries table
  And rate limiting enforces correctly

Scenario: Duplicate user roles are prevented
  Given a user already has the 'admin' role
  When an attempt is made to assign 'admin' again
  Then the operation fails with a unique constraint violation

Scenario: Login attempt tracking works on Postgres
  Given the application is running with Postgres
  When a user fails to log in
  Then the attempt is recorded in the loginAttempts table
  And account lockout triggers after 5 failures
```
