# E2-US35: Database Connection TLS Enforcement

**User Story**: As an operator, I want database connections to enforce TLS/SSL in production so that sensitive data (password hashes, PII, tokens) is never transmitted in plaintext over the network.

**Acceptance Criteria**:
- [ ] MongoDB connections use TLS when `NODE_ENV === 'production'` (either via `MongoClient` options or validated connection string)
- [ ] PostgreSQL connections use SSL when `NODE_ENV === 'production'` (via `postgres()` options or validated connection string)
- [ ] A startup validation warns or throws if a production database URL does not include TLS/SSL parameters
- [ ] TLS can be explicitly disabled for local development via an env var (e.g., `DB_TLS=false`)
- [ ] Connection factory tests verify TLS options are applied in production mode
- [ ] `closeDatabase()` properly closes the underlying connection before nullifying the reference

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add TLS options to `createMongoConnection` for production | packages/database/src/connections/mongo.ts |
| Database | Add SSL options to `createPostgresConnection` for production | packages/database/src/connections/sql.ts |
| Database | Add startup validation for TLS in production connection URLs | packages/database/src/connections/sql.ts, packages/database/src/connections/mongo.ts |
| Database | Fix `closeDatabase()` to invoke underlying close/destroy before nullifying | packages/database/src/connections/sql.ts |
| Database | Add `DB_TLS` env var support for explicit TLS control | packages/database/src/connections/types.ts |
| Database | Unit tests for TLS enforcement logic | packages/database/src/connections/mongo.test.ts, packages/database/src/connections/sql.test.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: MongoDB connection uses TLS in production
  Given NODE_ENV is "production"
  When a MongoDB connection is created
  Then the MongoClient should be configured with tls: true

Scenario: PostgreSQL connection uses SSL in production
  Given NODE_ENV is "production"
  When a PostgreSQL connection is created
  Then the postgres client should be configured with ssl: "require"

Scenario: Startup warns about missing TLS in production
  Given NODE_ENV is "production"
  And the MONGODB_URL does not contain "tls=true"
  When the connection factory initializes
  Then a warning should be logged about unencrypted database connection

Scenario: closeDatabase releases the underlying connection
  Given a database connection is open
  When closeDatabase() is called
  Then the underlying connection's close method should be invoked
  And the db reference should be null
```
