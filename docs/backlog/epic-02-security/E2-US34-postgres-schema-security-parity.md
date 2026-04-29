# E2-US34: Postgres Schema Security Parity

**User Story**: As an operator deploying with PostgreSQL, I want the Postgres schema to include all security-related tables (password reset tokens, rate limit entries, login attempts) so that brute-force protection, rate limiting, and password reset functionality work identically to the SQLite deployment.

**Acceptance Criteria**:
- [ ] `schema.postgres.ts` includes a `passwordResetTokens` table matching the SQLite schema definition
- [ ] `schema.postgres.ts` includes a `rateLimitEntries` table matching the SQLite schema definition
- [ ] `schema.postgres.ts` includes a `loginAttempts` table matching the SQLite schema definition
- [ ] All three new tables use appropriate PostgreSQL types (e.g., `timestamp` instead of `integer` for dates where applicable)
- [ ] The Drizzle Postgres adapters for these three tables compile and pass existing unit tests
- [ ] A schema parity test verifies both schemas export the same set of table names
- [ ] A `userRoles` unique constraint on `(userId, roleId)` is added to the Postgres schema to match MongoDB indexes

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add `passwordResetTokens` table to Postgres schema | packages/database/src/schema/schema.postgres.ts |
| Database | Add `rateLimitEntries` table to Postgres schema | packages/database/src/schema/schema.postgres.ts |
| Database | Add `loginAttempts` table to Postgres schema | packages/database/src/schema/schema.postgres.ts |
| Database | Add unique constraint on `(userId, roleId)` in Postgres `userRoles` | packages/database/src/schema/schema.postgres.ts |
| Database | Add unique constraint on `(userId, roleId)` in SQLite `userRoles` | packages/database/src/schema/schema.sqlite.ts |
| Database | Add schema parity test comparing table names across both schemas | packages/database/src/schema/schema.parity.test.ts |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Postgres schema includes all security tables
  Given the Postgres schema module is loaded
  When I inspect the exported table definitions
  Then it should include passwordResetTokens, rateLimitEntries, and loginAttempts
  And the column definitions should match the SQLite equivalents

Scenario: Schema parity between SQLite and Postgres
  Given both schema modules are loaded
  When I compare the set of exported table names
  Then both schemas should export the same table names

Scenario: userRoles unique constraint prevents duplicate assignments
  Given a user already has the "admin" role assigned
  When I attempt to assign "admin" to the same user again
  Then the database should reject the insert with a unique constraint violation
```
