# E7-US02: MongoDB Connection Factory

**User Story**: As a developer, I want to connect to MongoDB by setting a `MONGODB_URL` environment variable so that the application can use MongoDB as its persistence layer.

**Acceptance Criteria**:
- [ ] New `mongodb` driver package added as a dependency to `@acme/database`
- [ ] `src/connections/mongo.ts` creates and manages a MongoDB client connection
- [ ] Connection factory (`src/connections/index.ts`) checks for `MONGODB_URL` env var
- [ ] When `MONGODB_URL` is set, MongoDB connection is returned; otherwise falls back to SQL
- [ ] MongoDB connection exposes a `db` handle and a `close()` method
- [ ] Connection type is discriminated so consumers know which backend is active
- [ ] `.env.example` updated with `MONGODB_URL` placeholder

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Install `mongodb` driver package | packages/database/package.json |
| Database | Create `src/connections/mongo.ts` with `createMongoConnection()` | packages/database/src/connections/mongo.ts |
| Database | Define `MongoConnection` type wrapping `Db` and `MongoClient` | packages/database/src/connections/mongo.ts |
| Database | Define discriminated union `AppConnection` type (`{ type: 'sql', db } \| { type: 'mongo', db }`) | packages/database/src/connections/types.ts |
| Database | Update `src/connections/index.ts` factory to branch on `MONGODB_URL` | packages/database/src/connections/index.ts |
| Database | Export new connection types from `src/index.ts` | packages/database/src/index.ts |
| Config | Add `MONGODB_URL` to `.env.example` | .env.example |

**Dependencies**: E7-US01

**Complexity**: S

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: MongoDB connection created when MONGODB_URL is set
  Given MONGODB_URL is set to a valid MongoDB connection string
  When the connection factory runs
  Then a MongoConnection is returned with type 'mongo'

Scenario: SQL connection used when MONGODB_URL is not set
  Given MONGODB_URL is not set
  And DATABASE_URL or DATABASE_PATH is configured
  When the connection factory runs
  Then a SQL DatabaseConnection is returned with type 'sql'

Scenario: MongoDB connection provides database handle
  Given a MongoConnection is established
  When I access the db property
  Then I receive a valid MongoDB Db instance

Scenario: MongoDB connection can be closed
  Given a MongoConnection is established
  When I call close()
  Then the underlying MongoClient is disconnected
```
