# E2-US28: Mass Assignment Prevention

**User Story**: As a security-conscious developer, I want domain DTOs to separate internal and external update fields so that attackers cannot modify sensitive user properties (password hash, status, token version) through API endpoints that accept user updates.

**Acceptance Criteria**:
- [ ] `UpdateUserDTO` in the domain layer is split into `UpdateUserProfileDTO` (external) and `UpdateUserInternalDTO` (internal)
- [ ] `UpdateUserProfileDTO` only contains user-modifiable fields: `firstName`, `lastName`
- [ ] `UpdateUserInternalDTO` contains privileged fields: `passwordHash`, `isActive`, `status`, `tokenVersion`, `emailVerified`
- [ ] API controllers only accept `UpdateUserProfileDTO` for user-facing update endpoints
- [ ] Internal services (password reset, email verification, admin) use `UpdateUserInternalDTO`
- [ ] Database adapters validate which DTO type they receive and reject unexpected fields
- [ ] Unit tests verify that external DTOs cannot set privileged fields

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Split `UpdateUserDTO` into `UpdateUserProfileDTO` and `UpdateUserInternalDTO` | packages/domain/src/entities/User.ts |
| Domain | Update `UserRepository` port with separate update methods | packages/domain/src/ports/UserRepository.ts |
| Domain | Update use cases to use the appropriate DTO type | packages/domain/src/use-cases/ |
| Database | Update Drizzle adapter to enforce DTO field restrictions | packages/database/src/adapters/drizzle/DrizzleUserRepository.ts |
| Database | Update Mongo adapter to enforce DTO field restrictions | packages/database/src/adapters/mongo/MongoUserRepository.ts |
| API | Update controllers to use `UpdateUserProfileDTO` for user-facing endpoints | packages/api/src/controllers/ |
| Domain | Unit tests verifying field separation | packages/domain/src/entities/User.test.ts |
| Database | Unit tests verifying adapter rejects unexpected fields | packages/database/src/adapters/ |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: User profile update only accepts safe fields
  Given I am authenticated as a regular user
  When I send a PATCH request with firstName, lastName, and passwordHash
  Then only firstName and lastName are updated
  And passwordHash is ignored or rejected

Scenario: Internal update can modify privileged fields
  Given the password reset use case runs
  When it updates the user's passwordHash and tokenVersion
  Then both fields are updated successfully

Scenario: API controller strips privileged fields from user input
  Given I am authenticated as a regular user
  When I send a PATCH request with isActive: false and status: "banned"
  Then the response does not reflect those changes
  And my account remains active

Scenario: Database adapter validates DTO type
  Given a profile update DTO is passed to the repository
  When the DTO contains a passwordHash field
  Then the adapter ignores the passwordHash field
```
