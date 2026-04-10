# E2-US11: Seed Data & Production Safety Guards

**User Story**: As a platform operator, I want the seed script and test credentials to be impossible to run or access in production so that known default accounts cannot be exploited by attackers.

**Acceptance Criteria**:
- [x] Seed script exits immediately with an error if `NODE_ENV=production`
- [x] `TEST_CREDENTIALS` constant is not exported from the seed module (inlined or scoped locally)
- [x] Seed script does not print plaintext passwords to stdout
- [x] E2E seed file (`e2e/seed.ts`) is excluded from production builds
- [x] CI pipeline includes a check that no plaintext passwords appear in non-test source files
- [x] Default seed user passwords meet production password policy requirements
- [x] Documentation in README warns against running seed in production

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add production guard at top of seed script (`if NODE_ENV === production → exit 1`) | packages/database/src/seed.ts |
| Database | Remove `export` from `TEST_CREDENTIALS`; make it `const` (module-scoped) | packages/database/src/seed.ts |
| Database | Redact passwords from seed stdout output | packages/database/src/seed.ts |
| E2E | Keep E2E seed credentials in e2e/ only, not shared with database package | e2e/seed.ts |
| CI | Add CI step to scan for plaintext password patterns in non-test files | .github/workflows/test.yml |
| Docs | Add warning about seed script to README | README.md |
| Database | Unit test: seed script rejects when NODE_ENV=production | packages/database/src/seed.test.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: Seed script refuses to run in production
  Given NODE_ENV is set to "production"
  When I run the seed script
  Then it should exit with code 1
  And the error message should say "Seed script cannot run in production"

Scenario: Test credentials are not exported
  Given the seed module at packages/database/src/seed.ts
  When I check its exports
  Then TEST_CREDENTIALS should not be accessible from external imports

Scenario: Seed output does not contain plaintext passwords
  Given the seed script runs in development
  When I capture stdout
  Then no password strings should appear in the output
```
