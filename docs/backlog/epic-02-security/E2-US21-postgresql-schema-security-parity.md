# E2-US21: PostgreSQL Schema Security Parity

**User Story**: As a platform operator deploying to production with PostgreSQL, I want all security-related tables to exist in the PostgreSQL schema so that password reset, rate limiting, and account lockout features work correctly in production.

**Acceptance Criteria**:
- [ ] PostgreSQL schema defines a `password_reset_tokens` table matching the SQLite schema (id, user_id, token_hash, expires_at, used_at, created_at)
- [ ] PostgreSQL schema defines a `rate_limit_entries` table matching the SQLite schema (key, count, window_start, prev_count, prev_window_start, expires_at)
- [ ] PostgreSQL schema defines a `login_attempts` table matching the SQLite schema (id, email, attempts, lockout_count, locked_until, last_attempt_at, created_at)
- [ ] Drizzle PostgreSQL adapters exist for `PasswordResetTokenRepository`, `RateLimitRepository`, and `LoginAttemptRepository`
- [ ] All adapters pass the same unit tests as their SQLite counterparts
- [ ] A migration is generated and tested against a real PostgreSQL instance
- [ ] The seed script works with PostgreSQL for all security-related tables

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add `passwordResetTokens` table to PostgreSQL schema | packages/database/src/schema/schema.postgres.ts |
| Database | Add `rateLimitEntries` table to PostgreSQL schema | packages/database/src/schema/schema.postgres.ts |
| Database | Add `loginAttempts` table to PostgreSQL schema | packages/database/src/schema/schema.postgres.ts |
| Database | Add PostgreSQL adapter for `PasswordResetTokenRepository` | packages/database/src/adapters/drizzle-pg/ |
| Database | Add PostgreSQL adapter for `RateLimitRepository` | packages/database/src/adapters/drizzle-pg/ |
| Database | Add PostgreSQL adapter for `LoginAttemptRepository` | packages/database/src/adapters/drizzle-pg/ |
| Database | Update seed script to include security tables for PostgreSQL | packages/database/src/seed.ts |
| Database | Unit tests for all new PostgreSQL adapters | packages/database/src/adapters/drizzle-pg/*.test.ts |

**Dependencies**: E2-US04, E2-US05, E2-US06

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Password reset works on PostgreSQL
  Given the application is running with PostgreSQL
  When a user requests a password reset
  Then a reset token should be stored in the password_reset_tokens table
  And the reset flow should complete successfully

Scenario: Rate limiting works on PostgreSQL
  Given the application is running with PostgreSQL
  When a user exceeds the rate limit for login
  Then the request should be rejected with 429 Too Many Requests
  And rate limit entries should persist in the rate_limit_entries table

Scenario: Account lockout works on PostgreSQL
  Given the application is running with PostgreSQL
  When a user fails login 5 times
  Then the account should be locked
  And the lockout state should persist in the login_attempts table

Scenario: Seed script populates security tables on PostgreSQL
  Given a fresh PostgreSQL database
  When the seed script runs
  Then all security tables should be created
  And test data should be inserted correctly
```
