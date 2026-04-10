# E7-US03: Core Mongo Adapters

**User Story**: As a developer, I want MongoDB implementations of the core repository interfaces (User, Note, Role, UserRole) so that all CRUD and RBAC functionality works with MongoDB.

**Acceptance Criteria**:
- [ ] `MongoUserRepository` implements `UserRepository` port interface
- [ ] `MongoNoteRepository` implements `NoteRepository` port interface
- [ ] `MongoRoleRepository` implements `RoleRepository` port interface
- [ ] `MongoUserRoleRepository` implements `UserRoleRepository` port interface
- [ ] All adapters use the official `mongodb` driver (not Mongoose)
- [ ] Data modeled as flat collections with references (no embedded documents)
- [ ] Each adapter accepts a MongoDB `Db` instance via constructor
- [ ] UUID generation uses `crypto.randomUUID()` consistent with Drizzle adapters
- [ ] Date handling is consistent with domain entity expectations

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Create `src/adapters/mongo/` directory | packages/database/src/adapters/mongo/ |
| Database | Implement `MongoUserRepository` (create, findById, findByEmail, findAll, findByStatus, update, delete) | packages/database/src/adapters/mongo/MongoUserRepository.ts |
| Database | Implement `MongoNoteRepository` (create, findById, findByUserId, update, delete) | packages/database/src/adapters/mongo/MongoNoteRepository.ts |
| Database | Implement `MongoRoleRepository` (create, findById, findByName, findAll) | packages/database/src/adapters/mongo/MongoRoleRepository.ts |
| Database | Implement `MongoUserRoleRepository` (assign, revoke, findByUserId, findByRoleId, hasRole) | packages/database/src/adapters/mongo/MongoUserRoleRepository.ts |
| Database | Create `src/adapters/mongo/index.ts` barrel export | packages/database/src/adapters/mongo/index.ts |
| Database | Update `src/adapters/index.ts` to re-export from `mongo/` | packages/database/src/adapters/index.ts |

**Dependencies**: E7-US02

**Complexity**: L

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Create and retrieve a user via MongoDB
  Given a MongoUserRepository connected to a test database
  When I create a user with email "test@example.com"
  Then findByEmail("test@example.com") returns the created user
  And the user has a valid UUID id and timestamps

Scenario: Create and list notes for a user via MongoDB
  Given a MongoNoteRepository connected to a test database
  And a user with id "user-1" exists
  When I create two notes for user "user-1"
  Then findByUserId("user-1") returns both notes

Scenario: Assign and check roles via MongoDB
  Given MongoRoleRepository and MongoUserRoleRepository connected to a test database
  And a role "admin" exists
  And a user "user-1" exists
  When I assign role "admin" to user "user-1"
  Then hasRole("user-1", "admin") returns true

Scenario: Delete a user via MongoDB
  Given a MongoUserRepository with an existing user
  When I delete the user by id
  Then findById returns null
```
