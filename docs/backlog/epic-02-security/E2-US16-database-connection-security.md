# E2-US16: Database Connection Security & TLS Enforcement

**User Story**: As a platform operator, I want database connections to enforce TLS in production and credentials to be handled securely so that data in transit between the API and database is encrypted and connection strings are not exposed.

**Acceptance Criteria**:
- [ ] PostgreSQL connections in production require TLS (`ssl: { rejectUnauthorized: true }`) by default
- [ ] A `DATABASE_SSL` environment variable allows overriding SSL mode (e.g. `require`, `verify-full`, `disable`)
- [ ] Connection strings are never logged (not in startup messages, not in error messages)
- [ ] SQLite database file permissions are restricted to owner-only (`0600`) when created
- [ ] Database connection errors are caught and logged without exposing credentials
- [ ] Connection pool settings are configured for production (max connections, idle timeout)
- [ ] Unit tests verify SSL options are applied based on environment variables
- [ ] Startup logs confirm database type (SQLite/PostgreSQL) without exposing connection details

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add SSL/TLS options to PostgreSQL connection factory | packages/database/src/connection.ts |
| Database | Parse `DATABASE_SSL` env var and apply to postgres client options | packages/database/src/connection.ts |
| Database | Set file permissions on SQLite database file after creation | packages/database/src/connection.ts |
| Database | Add connection pool configuration (max, idle timeout) | packages/database/src/connection.ts |
| Database | Wrap connection creation in try/catch to sanitize error output | packages/database/src/connection.ts |
| API | Log database type on startup without connection string details | packages/api/src/main.ts |
| Database | Unit tests for SSL configuration logic | packages/database/src/connection.test.ts |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: PostgreSQL connection uses TLS in production
  Given NODE_ENV is "production" and DATABASE_URL is a PostgreSQL URL
  When the database connection is created
  Then the connection options include ssl with rejectUnauthorized=true

Scenario: DATABASE_SSL=disable skips TLS
  Given DATABASE_SSL is set to "disable"
  When the database connection is created
  Then the connection options do not include ssl

Scenario: Connection error does not expose credentials
  Given an invalid DATABASE_URL with embedded password
  When the connection fails
  Then the error message does not contain the password or full URL

Scenario: SQLite file has restricted permissions
  Given a new SQLite database is created
  When the file is created on disk
  Then the file permissions should be 0600 (owner read/write only)

Scenario: Startup log shows database type safely
  Given the server starts with a PostgreSQL connection
  When the startup message is logged
  Then it shows "Connected to PostgreSQL" without the connection string
```
