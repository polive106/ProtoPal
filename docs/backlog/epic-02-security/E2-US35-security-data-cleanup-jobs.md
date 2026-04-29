# E2-US35: Security Data Cleanup Jobs

**User Story**: As a platform operator, I want expired login attempt records and rate limit entries to be automatically cleaned up so that the database does not accumulate stale security data indefinitely, degrading performance and consuming storage.

**Acceptance Criteria**:
- [ ] A scheduled cleanup job removes login attempt records older than 24 hours (configurable)
- [ ] A scheduled cleanup job removes expired rate limit entries
- [ ] MongoDB collections use TTL indexes where applicable (`login_attempts.lastAttemptAt`, `rate_limit_entries.expiresAt`)
- [ ] Drizzle/SQLite adapters have equivalent cleanup queries triggered by the scheduled job
- [ ] The cleanup interval is configurable via environment variable (default: 1 hour)
- [ ] Cleanup failures are logged but do not crash the application
- [ ] Existing `TokenCleanupService` is extended or a new `SecurityDataCleanupService` is created

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add TTL index on `login_attempts.lastAttemptAt` for MongoDB | packages/database/src/setup/mongo-indexes.ts |
| Database | Ensure `rate_limit_entries` uses Date objects for TTL index compatibility | packages/database/src/adapters/mongo/MongoRateLimitRepository.ts |
| Database | Add `deleteExpiredAttempts(olderThan: Date)` to `LoginAttemptRepository` port | packages/domain/src/ports/LoginAttemptRepository.ts |
| Database | Implement cleanup method in Drizzle and Mongo login attempt adapters | packages/database/src/adapters/ |
| API | Create `SecurityDataCleanupService` or extend `TokenCleanupService` with login attempt and rate limit cleanup | packages/api/src/services/TokenCleanupService.ts |
| API | Unit tests for cleanup service | packages/api/src/services/TokenCleanupService.test.ts |
| Database | Unit tests for new adapter methods | packages/database/src/adapters/ |

**Dependencies**: E2-US04, E2-US05

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Expired login attempts are cleaned up
  Given login attempt records older than 24 hours exist
  When the cleanup job runs
  Then records older than 24 hours are deleted
  And recent records are preserved

Scenario: Expired rate limit entries are cleaned up
  Given rate limit entries with past expiration timestamps exist
  When the cleanup job runs
  Then expired entries are deleted
  And active entries are preserved

Scenario: Cleanup failure does not crash the application
  Given the database is temporarily unavailable
  When the cleanup job runs
  Then an error is logged
  And the application continues running normally

Scenario: MongoDB TTL index auto-deletes expired login attempts
  Given a login attempt record with lastAttemptAt older than 24 hours
  Then MongoDB automatically removes the record via TTL index
```
