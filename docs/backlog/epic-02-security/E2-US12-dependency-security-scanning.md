# E2-US12: Dependency Security Scanning & Supply Chain Protection

**User Story**: As a platform operator, I want automated dependency vulnerability scanning in CI so that known security vulnerabilities in third-party packages are detected before they reach production.

**Acceptance Criteria**:
- [x] `pnpm audit` runs as a CI step on every push and PR
- [x] CI fails if any `critical` or `high` severity vulnerabilities are found
- [x] A weekly scheduled workflow runs full audit and opens an issue if new vulnerabilities are found
- [x] `package-lock.yaml` / `pnpm-lock.yaml` is committed and validated (no floating versions in lock file)
- [x] `.npmrc` enforces `strict-peer-dependencies=true` to prevent dependency confusion
- [x] GitHub Dependabot or Renovate is configured for automated dependency update PRs
- [x] Lock file integrity is verified in CI (no unexpected changes)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| CI | Add `pnpm audit --audit-level=high` step to test workflow | .github/workflows/test.yml |
| CI | Create weekly scheduled audit workflow that opens GitHub issues | .github/workflows/security-audit.yml |
| Config | Ensure `.npmrc` has `strict-peer-dependencies=true` | .npmrc |
| Config | Add Dependabot configuration for automated dependency PRs | .github/dependabot.yml |
| CI | Add lock file integrity check (verify no unreviewed changes) | .github/workflows/test.yml |
| Docs | Document dependency update process in README | README.md |

**Dependencies**: None

**Complexity**: S

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: CI catches high severity vulnerability
  Given a dependency with a known high severity CVE
  When the CI test workflow runs
  Then the audit step should fail
  And the output should list the affected package and CVE

Scenario: Weekly audit opens issue for new vulnerabilities
  Given the weekly audit workflow runs on schedule
  When new vulnerabilities are found since last run
  Then a GitHub issue should be created with vulnerability details

Scenario: Dependabot creates update PR
  Given a dependency has a newer patch version available
  When Dependabot runs its scheduled check
  Then a pull request should be created to update the dependency
```
