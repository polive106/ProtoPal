# E4-US07: Consolidate MongoDB Adapter Test Infrastructure and Shared Types

**User Story**: As a developer, I want MongoDB adapter tests to share lifecycle boilerplate and document interfaces so that adding a new adapter doesn't require copy-pasting setup code, and interface changes are reflected in one place.

**Acceptance Criteria**:
- [ ] A shared test context helper (e.g., `createRepoTestSuite<T>(factory: (db: Db) => T)`) replaces the duplicated 12-line `beforeAll`/`afterAll`/`beforeEach` block across all 8 Mongo adapter test files
- [ ] `clearCollections()` uses `deleteMany({})` on known collection names from `COLLECTION_NAMES` instead of calling `db.listCollections().toArray()` on every `beforeEach`
- [ ] `UserDoc`, `RoleDoc`, and other MongoDB document interfaces are defined once in `packages/database/src/adapters/mongo/types.ts` and imported by all adapters that need them (currently `MongoUserRoleRepository` redeclares partial copies of `UserDoc` and `RoleDoc`)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Create `createRepoTestSuite` helper that encapsulates `setupTestDb`/`teardownTestDb`/`clearCollections` lifecycle | `packages/database/src/adapters/mongo/test-helper.ts` |
| Database | Refactor all 8 test files to use the shared helper | `packages/database/src/adapters/mongo/*.test.ts` |
| Database | Change `clearCollections` to use `deleteMany` on `COLLECTION_NAMES` instead of `listCollections` | `packages/database/src/adapters/mongo/test-helper.ts` |
| Database | Extract `UserDoc`, `RoleDoc`, `NoteDoc`, etc. into `types.ts` | `packages/database/src/adapters/mongo/types.ts` (new) |
| Database | Import shared doc types in `MongoUserRoleRepository`, `MongoUserRepository`, `MongoRoleRepository` | `packages/database/src/adapters/mongo/Mongo*Repository.ts` |

**Dependencies**: None

**Complexity**: S

**Status**: To Do

**Test Scenarios**:
```gherkin
Scenario: Adding a new Mongo adapter test
  Given the createRepoTestSuite helper exists
  When a developer creates a new adapter test
  Then they call createRepoTestSuite with a factory function
  And lifecycle setup/teardown is handled automatically

Scenario: clearCollections performance
  Given 8 test files run in a suite
  When beforeEach fires
  Then no listCollections call is made (uses known collection names directly)
```
