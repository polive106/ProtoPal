# E7-US06: DI Wiring for Database Selection

**User Story**: As a developer, I want the NestJS dependency injection to automatically wire the correct repository adapters (Drizzle or Mongo) based on which database connection is active so that switching databases requires only an environment variable change.

**Acceptance Criteria**:
- [ ] `DatabaseModule` detects active connection type (SQL vs MongoDB)
- [ ] When MongoDB is active, all repository tokens resolve to `Mongo*Repository` instances
- [ ] When SQL is active, all repository tokens resolve to `Drizzle*Repository` instances (existing behavior)
- [ ] No changes to `DomainModule` or any consumer of repository tokens
- [ ] Application starts and all endpoints work correctly with MongoDB
- [ ] Application starts and all endpoints work correctly with SQL (no regression)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Update `DatabaseModule` to branch provider registration based on connection type | packages/api/src/modules/database.module.ts |
| API | Create `mongoRepositoryProvider()` helper analogous to `repositoryProvider()` | packages/api/src/modules/database.module.ts |
| API | Import all `Mongo*Repository` classes from `@acme/database` | packages/api/src/modules/database.module.ts |
| Database | Ensure `src/index.ts` exports all Mongo adapters and connection type discriminator | packages/database/src/index.ts |
| API | Update `DATABASE_CONNECTION` provider factory to handle both connection types | packages/api/src/modules/database.module.ts |

**Dependencies**: E7-US05

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: MongoDB adapters wired when MONGODB_URL is set
  Given MONGODB_URL is set to a valid connection string
  When the NestJS application starts
  Then USER_REPOSITORY resolves to MongoUserRepository
  And NOTE_REPOSITORY resolves to MongoNoteRepository
  And all other repository tokens resolve to Mongo adapters

Scenario: Drizzle adapters wired when MONGODB_URL is not set
  Given MONGODB_URL is not set
  When the NestJS application starts
  Then USER_REPOSITORY resolves to DrizzleUserRepository
  And all other repository tokens resolve to Drizzle adapters

Scenario: All API endpoints work with MongoDB backend
  Given the application is running with MongoDB
  When I call POST /auth/register, POST /auth/login, GET /notes
  Then all endpoints return expected responses

Scenario: No regression with SQL backend
  Given the application is running with SQL (no MONGODB_URL)
  When I run the full E2E test suite
  Then all tests pass
```
