# E2-US27: Database Connection Security & TLS Enforcement

**User Story**: As a platform operator, I want database connections to be validated at startup and encrypted in production so that credentials cannot leak through error messages and data in transit is protected from eavesdropping.

**Acceptance Criteria**:
- [ ] `createMongoConnection()` validates the URL format before attempting to connect (rejects malformed strings)
- [ ] PostgreSQL connections enforce `ssl: { rejectUnauthorized: true }` when `NODE_ENV === 'production'`
- [ ] MongoDB connections include `tls=true` parameter enforcement in production
- [ ] Database connection errors are caught and logged without exposing credentials (host/port only, no username/password)
- [ ] `validateStartupEnv()` checks that `DATABASE_PATH` or `DATABASE_URL` or `MONGODB_URL` is set (at least one required)
- [ ] Connection pool settings are configured with reasonable limits (`max`, `idleTimeoutMillis`) to prevent resource exhaustion
- [ ] A startup health check verifies database connectivity and logs the connection type (SQLite/PostgreSQL/MongoDB) without credentials

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add URL format validation to `createMongoConnection()` (reject invalid URLs) | packages/database/src/connections/mongo.ts |
| Database | Add TLS enforcement option for MongoDB connections in production | packages/database/src/connections/mongo.ts |
| Database | Add TLS/SSL enforcement for PostgreSQL connections in production | packages/database/src/connections/postgres.ts |
| Database | Wrap connection errors to strip credentials from error messages | packages/database/src/connections/mongo.ts, packages/database/src/connections/postgres.ts |
| Database | Add connection pool configuration (max connections, idle timeout) | packages/database/src/connections/postgres.ts |
| API | Extend `validateStartupEnv()` to require at least one database URL | packages/api/src/main.ts |
| API | Add startup health check that logs connection type without credentials | packages/api/src/main.ts |
| Database | Unit tests for URL validation and credential stripping | packages/database/src/connections/mongo.test.ts, packages/database/src/connections/postgres.test.ts |

**Dependencies**: E2-US19

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Malformed MongoDB URL rejected at startup
  Given MONGODB_URL is 'not-a-valid-url'
  When the application attempts to connect
  Then it should throw an error about invalid URL format
  And the error message should not contain the raw URL

Scenario: Production MongoDB connection enforces TLS
  Given NODE_ENV is 'production'
  And MONGODB_URL is a valid MongoDB connection string
  When the application connects to MongoDB
  Then the connection should include TLS options

Scenario: Database error does not expose credentials
  Given DATABASE_URL contains username and password
  When a connection error occurs
  Then the logged error should show host and port only
  And the error response should not contain credentials

Scenario: Startup requires at least one database configuration
  Given no DATABASE_PATH, DATABASE_URL, or MONGODB_URL is set
  When the application starts
  Then it should throw an error about missing database configuration

Scenario: Connection pool limits are enforced
  Given DATABASE_URL is configured with PostgreSQL
  When the connection pool is created
  Then max connections should be capped at a configured limit
  And idle connections should timeout after the configured period
```
