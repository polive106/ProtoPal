# E8-US07: MongoDB Query Sanitization

**User Story**: As a platform operator, I want MongoDB queries to be protected against operator injection so that attackers cannot manipulate query logic even if API-layer validation is bypassed.

**Security Finding**: MongoDB adapters pass user-controlled values directly into query filter objects without sanitization. For example:
- `MongoUserRepository.ts` line 52: `await this.collection.findOne({ email })` — if `email` is an object like `{ $ne: "" }`, it becomes a query operator
- `MongoNoteRepository.ts` line 37: `await this.collection.findOne({ _id: id })`
- `MongoLoginAttemptRepository.ts`: `await this.collection.findOne({ email })`

While Zod validation at the API layer ensures inputs are strings (preventing direct object injection via HTTP), defense-in-depth requires sanitization at the database layer because:
- Internal callers may bypass API validation
- Future code changes might introduce new entry points
- The MongoDB driver accepts operator objects in query filters by default

**Current State**:
- All MongoDB adapter files in `packages/database/src/adapters/mongo/` use raw values in queries
- No `mongo-sanitize` or equivalent library is used
- Zod at the API layer validates strings, providing the primary defense

**Acceptance Criteria**:
- [ ] A `sanitizeQueryValue()` utility strips `$`-prefixed keys from any object passed as a MongoDB filter value
- [ ] All MongoDB repository `find*` methods sanitize user-controlled parameters before querying
- [ ] The sanitization utility is unit tested with operator injection payloads (`$ne`, `$gt`, `$regex`, `$where`)
- [ ] Existing MongoDB adapter tests pass with sanitization in place
- [ ] A shared utility in `packages/database/src/adapters/mongo/utils.ts` handles sanitization

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add `sanitizeQueryValue()` utility | packages/database/src/adapters/mongo/utils.ts |
| Database | Apply sanitization in MongoUserRepository | packages/database/src/adapters/mongo/MongoUserRepository.ts |
| Database | Apply sanitization in MongoNoteRepository | packages/database/src/adapters/mongo/MongoNoteRepository.ts |
| Database | Apply sanitization in MongoLoginAttemptRepository | packages/database/src/adapters/mongo/MongoLoginAttemptRepository.ts |
| Database | Apply sanitization in all other Mongo repositories | packages/database/src/adapters/mongo/ |
| Database | Unit tests for sanitization utility | packages/database/src/adapters/mongo/utils.test.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: MongoDB operator injection is prevented
  Given a query filter value of { "$ne": "" }
  When sanitizeQueryValue is applied
  Then the value should be rejected or stripped to prevent operator injection

Scenario: Normal string values pass through sanitization
  Given a query filter value of "user@example.com"
  When sanitizeQueryValue is applied
  Then the value should be unchanged

Scenario: findByEmail rejects operator objects
  Given an email parameter that is somehow an object with $gt
  When MongoUserRepository.findByEmail is called
  Then the query should use a safe string value, not the operator
```
