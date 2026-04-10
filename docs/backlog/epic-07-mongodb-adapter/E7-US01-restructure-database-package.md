# E7-US01: Restructure @acme/database Package

**User Story**: As a developer, I want the `@acme/database` package organized by concern (connections, adapters, schema) so that adding new database backends is straightforward and the existing SQL path remains stable.

**Acceptance Criteria**:
- [ ] Existing Drizzle adapters moved to `src/adapters/drizzle/` subdirectory
- [ ] SQL connection logic moved to `src/connections/sql.ts`
- [ ] Connection factory extracted to `src/connections/index.ts`
- [ ] Schema files moved to `src/schema/` subdirectory
- [ ] Barrel exports (`src/index.ts`) updated so all public imports remain unchanged
- [ ] `@acme/api` `DatabaseModule` imports work without modification
- [ ] All existing unit tests pass without changes
- [ ] All existing E2E tests pass without regressions

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Create `src/connections/` directory and move `connection.ts` to `src/connections/sql.ts` | packages/database/src/connections/sql.ts |
| Database | Create `src/connections/index.ts` re-exporting the connection factory | packages/database/src/connections/index.ts |
| Database | Move all `Drizzle*Repository` files into `src/adapters/drizzle/` | packages/database/src/adapters/drizzle/*.ts |
| Database | Create `src/adapters/drizzle/index.ts` barrel export | packages/database/src/adapters/drizzle/index.ts |
| Database | Update `src/adapters/index.ts` to re-export from `drizzle/` | packages/database/src/adapters/index.ts |
| Database | Move `schema.sqlite.ts`, `schema.postgres.ts`, `schema.ts` into `src/schema/` | packages/database/src/schema/*.ts |
| Database | Update `src/index.ts` barrel to reflect new paths | packages/database/src/index.ts |
| Database | Update all internal imports within adapter and connection files | packages/database/src/adapters/drizzle/*.ts, packages/database/src/connections/sql.ts |
| API | Verify `DatabaseModule` imports resolve correctly (no code changes expected) | packages/api/src/modules/database.module.ts |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: All existing imports resolve after restructure
  Given the database package has been restructured
  When I build the @acme/database package
  Then the build succeeds with no errors

Scenario: Existing tests pass after restructure
  Given the database package has been restructured
  When I run the full test suite
  Then all existing unit and E2E tests pass

Scenario: API module wiring is unaffected
  Given the database package has been restructured
  When the NestJS application starts
  Then all repository providers resolve correctly
  And the health check endpoint returns 200
```
