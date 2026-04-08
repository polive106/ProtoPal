# E2-US13: Critical Dependency Vulnerability Remediation

**User Story**: As a platform operator, I want all known critical and high-severity dependency vulnerabilities patched immediately so that the application is not exposed to published exploits.

**Acceptance Criteria**:
- [ ] `drizzle-orm` updated to >= 0.45.2 to fix SQL injection via improperly escaped SQL identifiers (GHSA-gpj5-g38j-94v9)
- [ ] `vite` updated to >= 6.4.2 to fix arbitrary file read via WebSocket (GHSA-p9ff-h696-f583) and path traversal in optimized deps `.map` handling (GHSA-4w7w-66w2-5vf9)
- [ ] `@nestjs/core` updated to >= 11.1.18 to fix injection vulnerability (GHSA-36xv-jgw5-4q75)
- [ ] `path-to-regexp` updated to >= 8.4.0 to fix ReDoS via sequential optional groups (GHSA-j3q9-mxjg-w52f) and multiple wildcards (GHSA-27v5-c462-wpq7)
- [ ] All existing unit tests pass after updates
- [ ] All E2E tests pass after updates
- [ ] `pnpm audit` reports zero high or critical vulnerabilities
- [ ] Drizzle schema and migrations verified compatible with new drizzle-orm version

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Update `drizzle-orm` and `drizzle-kit` to latest compatible versions | packages/database/package.json |
| Database | Verify schema compatibility — run `db:push` and `db:seed` successfully | packages/database/src/schema.sqlite.ts, seed.ts |
| Database | Update any Drizzle API usage that changed between 0.39 and 0.45+ | packages/database/src/adapters/*.ts |
| Frontend | Update `vite` to >= 6.4.2 | packages/frontend/package.json |
| API | Update `@nestjs/core` and `@nestjs/common` to >= 11.1.18 | packages/api/package.json |
| API | Verify `path-to-regexp` updated transitively or pin explicitly | packages/api/package.json |
| Root | Run `pnpm audit` and verify zero high/critical findings | pnpm-lock.yaml |
| Tests | Run full test suite (`pnpm test` and `pnpm test:e2e`) | All test files |

**Dependencies**: None (should be done before all other pending stories)

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Drizzle ORM update does not break database operations
  Given drizzle-orm is updated to >= 0.45.2
  When I run the full database adapter test suite
  Then all tests should pass
  And db:push and db:seed should complete successfully

Scenario: Vite update does not break frontend build
  Given vite is updated to >= 6.4.2
  When I run `pnpm build` for the frontend package
  Then the build should succeed
  And the dev server should start without errors

Scenario: NestJS update does not break API
  Given @nestjs/core is updated to >= 11.1.18
  When I run the API test suite
  Then all tests should pass
  And the API server should start without errors

Scenario: No remaining high/critical vulnerabilities
  When I run `pnpm audit`
  Then zero high or critical severity vulnerabilities should be reported
```
