# E2-US21: PostgreSQL Schema Security Parity

**User Story**: As a platform operator deploying to PostgreSQL, I want the PostgreSQL schema to include all security-related tables (login attempts, password reset tokens, rate limit entries) so that brute force protection, password reset, and rate limiting work identically to the SQLite configuration.

**Acceptance Criteria**:
- [ ] `login_attempts` table exists in PostgreSQL schema with same columns as SQLite: id, email, attempted_at, successful, ip_address, locked_until
- [ ] `password_reset_tokens` table exists in PostgreSQL schema with same columns as SQLite: id, user_id, token_hash, expires_at, used_at, created_at
- [ ] `rate_limit_entries` table exists in PostgreSQL schema with same columns as SQLite: id, key, timestamp, window_ms
- [ ] All foreign key constraints and cascading deletes match the SQLite schema
- [ ] PostgreSQL-specific Drizzle adapters exist for LoginAttemptRepository, PasswordResetTokenRepository, and RateLimitRepository
- [ ] Integration tests verify brute force lockout works on PostgreSQL
- [ ] Integration tests verify password reset flow works on PostgreSQL
- [ ] Integration tests verify rate limiting works on PostgreSQL
- [ ] A migration file is generated for existing PostgreSQL deployments

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add `login_attempts` table definition to PostgreSQL schema | packages/database/src/schema/schema.postgres.ts |
| Database | Add `password_reset_tokens` table definition to PostgreSQL schema | packages/database/src/schema/schema.postgres.ts |
| Database | Add `rate_limit_entries` table definition to PostgreSQL schema | packages/database/src/schema/schema.postgres.ts |
| Database | Add PostgreSQL adapter for LoginAttemptRepository | packages/database/src/adapters/drizzle/DrizzleLoginAttemptRepository.ts |
| Database | Add PostgreSQL adapter for PasswordResetTokenRepository | packages/database/src/adapters/drizzle/DrizzlePasswordResetTokenRepository.ts |
| Database | Add PostgreSQL adapter for RateLimitRepository | packages/database/src/adapters/drizzle/DrizzleRateLimitRepository.ts |
| Database | Generate Drizzle migration for the new tables | packages/database/migrations/ |
| Database | Update PostgreSQL seed script to include login attempts and rate limit test data | packages/database/src/seed.ts |
| API | Verify database.module.ts correctly wires PostgreSQL adapters for all security repositories | packages/api/src/modules/database.module.ts |
| API | Integration tests for brute force lockout on PostgreSQL | packages/api/src/controllers/auth.controller.integration.test.ts |

**Dependencies**: E2-US04, E2-US05, E2-US06

**Complexity**: L

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Brute force lockout works on PostgreSQL
  Given the application is connected to PostgreSQL
  When a user fails login 5 times
  Then the account should be locked for 5 minutes
  And the login_attempts table should contain 5 rows for that email

Scenario: Password reset flow works on PostgreSQL
  Given the application is connected to PostgreSQL
  When a user requests a password reset
  Then a hashed token should be stored in password_reset_tokens
  And the user should be able to reset their password with the token

Scenario: Rate limiting works on PostgreSQL
  Given the application is connected to PostgreSQL
  When a user exceeds the register rate limit (3 per hour)
  Then the 4th request should return 429 Too Many Requests
  And rate_limit_entries should contain the tracking records

Scenario: PostgreSQL schema matches SQLite security tables
  Given both schema files are compared
  Then login_attempts columns should match between SQLite and PostgreSQL
  And password_reset_tokens columns should match between SQLite and PostgreSQL
  And rate_limit_entries columns should match between SQLite and PostgreSQL
```
