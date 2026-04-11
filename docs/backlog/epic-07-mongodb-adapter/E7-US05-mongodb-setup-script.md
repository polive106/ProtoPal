# E7-US05: MongoDB Setup Script

**User Story**: As a developer, I want a setup script that initializes MongoDB collections, indexes, and seed data so that the database is ready to use without manual configuration.

**Acceptance Criteria**:
- [ ] Setup script creates all required collections (users, notes, roles, user_roles, login_attempts, verification_tokens, password_reset_tokens, token_blacklist, rate_limits)
- [ ] Unique indexes created: `users.email`, `roles.name`, `token_blacklist.token_hash`
- [ ] Compound indexes created where needed (e.g., `user_roles(user_id, role_id)`, `notes(user_id)`)
- [ ] TTL indexes created for expiring collections (verification_tokens, password_reset_tokens, token_blacklist, rate_limits)
- [ ] Default roles seeded: `admin`, `user`
- [ ] Script is idempotent — safe to run multiple times
- [ ] Script can be run via a package.json script (e.g., `pnpm db:setup:mongo`)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Create `src/setup/mongo-setup.ts` with collection creation, index setup, and seeding | packages/database/src/setup/mongo-setup.ts |
| Database | Define index specifications as constants for documentation and reuse | packages/database/src/setup/mongo-indexes.ts |
| Database | Add `db:setup:mongo` script to package.json | packages/database/package.json |
| Database | Export setup function from `src/index.ts` | packages/database/src/index.ts |

**Dependencies**: E7-US03, E7-US04

**Complexity**: S

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: Setup script creates all collections
  Given an empty MongoDB database
  When I run the setup script
  Then all 9 collections exist in the database

Scenario: Setup script creates required indexes
  Given an empty MongoDB database
  When I run the setup script
  Then users collection has a unique index on email
  And roles collection has a unique index on name
  And user_roles collection has a compound index on user_id and role_id

Scenario: Setup script seeds default roles
  Given an empty MongoDB database
  When I run the setup script
  Then the roles collection contains "admin" and "user" roles

Scenario: Setup script is idempotent
  Given the setup script has already been run once
  When I run the setup script again
  Then no errors occur
  And no duplicate roles are created
  And indexes remain intact
```
