# E2-US34: PostgreSQL Schema Security Parity

**User Story**: As a platform operator, I want the PostgreSQL schema to include all security-related tables present in the SQLite schema so that security features (rate limiting, login attempt tracking, password resets) function correctly when deploying with PostgreSQL.

**Acceptance Criteria**:
- [ ] PostgreSQL schema includes `passwordResetTokens` table with identical columns/constraints to SQLite version
- [ ] PostgreSQL schema includes `rateLimitEntries` table with identical columns/constraints to SQLite version
- [ ] PostgreSQL schema includes `loginAttempts` table with identical columns/constraints to SQLite version
- [ ] `passwordHash` column on users table has a `NOT NULL` constraint in both SQLite and PostgreSQL schemas
- [ ] `assignedBy` column on userRoles table has an explicit `onDelete` action (SET NULL or CASCADE) in both schemas
- [ ] All Drizzle adapters for security tables work with both SQLite and PostgreSQL connections
- [ ] Seed script works correctly with PostgreSQL (security tables are populated)
- [ ] Unit tests verify schema parity between SQLite and PostgreSQL table definitions

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add `passwordResetTokens` table to PostgreSQL schema | packages/database/src/schema/schema.postgres.ts |
| Database | Add `rateLimitEntries` table to PostgreSQL schema | packages/database/src/schema/schema.postgres.ts |
| Database | Add `loginAttempts` table to PostgreSQL schema | packages/database/src/schema/schema.postgres.ts |
| Database | Add `.notNull()` to `passwordHash` on users table (both schemas) | packages/database/src/schema/schema.sqlite.ts, schema.postgres.ts |
| Database | Add `onDelete: 'set null'` to `assignedBy` reference (both schemas) | packages/database/src/schema/schema.sqlite.ts, schema.postgres.ts |
| Database | Update seed.ts to seed security tables for PostgreSQL | packages/database/src/seed.ts |
| Database | Add schema parity unit tests | packages/database/src/schema/schema-parity.test.ts |

**Dependencies**: E2-US04, E2-US05, E2-US06

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: PostgreSQL schema includes password reset tokens table
  Given I connect to a PostgreSQL database with the schema applied
  When I query the passwordResetTokens table
  Then the table exists with userId, tokenHash, expiresAt, usedAt columns

Scenario: PostgreSQL schema includes rate limit entries table
  Given I connect to a PostgreSQL database with the schema applied
  When I query the rateLimitEntries table
  Then the table exists with key, points, expiresAt columns

Scenario: PostgreSQL schema includes login attempts table
  Given I connect to a PostgreSQL database with the schema applied
  When I query the loginAttempts table
  Then the table exists with email, attempts, lockedUntil columns

Scenario: Password hash cannot be null
  Given I attempt to insert a user without a passwordHash
  Then the database rejects the insert with a NOT NULL violation

Scenario: All security adapters work with PostgreSQL
  Given a PostgreSQL connection
  When I run the rate limit, login attempt, and password reset adapters
  Then all CRUD operations succeed without errors
```
