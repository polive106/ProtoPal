# E4-US06: Add Missing MongoDB Indexes and Optimize Queries

**User Story**: As a developer, I want all MongoDB collections to have proper indexes on their query fields so that lookups on auth hot paths don't degrade to full collection scans.

**Acceptance Criteria**:
- [ ] `verification_tokens` collection has a unique index on `tokenHash`
- [ ] `password_reset_tokens` collection has a unique index on `tokenHash`
- [ ] `rate_limit_entries` collection has a unique index on `key`
- [ ] `getUserWithRoles` in `MongoUserRoleRepository` parallelizes the user lookup and user_roles lookup via `Promise.all`
- [ ] `ensureDate` utility is moved to a shared adapter-level location (`packages/database/src/adapters/utils.ts`) and used by both Drizzle and Mongo adapters (currently inline ternaries in 5 Drizzle files, utility in `mongo/utils.ts`)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add `{ tokenHash: 1, unique: true }` index to `verification_tokens` | `packages/database/src/setup/mongo-indexes.ts` |
| Database | Add `{ tokenHash: 1, unique: true }` index to `password_reset_tokens` | `packages/database/src/setup/mongo-indexes.ts` |
| Database | Add `{ key: 1, unique: true }` index to `rate_limit_entries` | `packages/database/src/setup/mongo-indexes.ts` |
| Database | Parallelize user + user_roles fetch in `getUserWithRoles` | `packages/database/src/adapters/mongo/MongoUserRoleRepository.ts` |
| Database | Move `ensureDate` to `packages/database/src/adapters/utils.ts` | `packages/database/src/adapters/mongo/utils.ts` -> `packages/database/src/adapters/utils.ts` |
| Database | Replace inline date coercion ternaries in Drizzle adapters with `ensureDate` | `DrizzleUserRepository.ts`, `DrizzleNoteRepository.ts`, `DrizzleRoleRepository.ts`, `DrizzleUserRoleRepository.ts`, `DrizzleLoginAttemptRepository.ts` |

**Dependencies**: None

**Complexity**: S

**Status**: To Do

**Test Scenarios**:
```gherkin
Scenario: Token hash lookup uses index
  Given the verification_tokens collection has a tokenHash index
  When findByTokenHash is called
  Then the query uses the index (no collection scan)

Scenario: getUserWithRoles fetches in parallel
  Given a valid userId
  When getUserWithRoles is called
  Then the user and user_roles queries run concurrently via Promise.all
```
