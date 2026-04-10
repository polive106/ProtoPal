# E7-US05: CI/CD Workflow Security Hardening

**User Story**: As a platform operator, I want CI/CD workflows to follow least-privilege principles and avoid supply chain risks so that compromised dependencies or actions cannot escalate privileges.

**Acceptance Criteria**:
- [ ] All GitHub Actions workflows have explicit `permissions` blocks with minimum required scopes
- [ ] The Maestro CLI install in e2e-mobile.yml uses a pinned version or checksum verification instead of `curl | bash`
- [ ] Third-party community actions are pinned to full commit SHAs (not just version tags)
- [ ] Security-critical packages (`bcrypt`, `jose`, `helmet`) use exact version pinning in package.json
- [ ] Pre-commit hooks include `pnpm audit --audit-level=high` check

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| CI | Add explicit `permissions: { contents: read }` to test.yml | .github/workflows/test.yml |
| CI | Add explicit `permissions: { contents: read }` to e2e.yml | .github/workflows/e2e.yml |
| CI | Add `permissions: { contents: read, issues: write }` to security-audit.yml | .github/workflows/security-audit.yml |
| CI | Add explicit permissions to e2e-mobile.yml | .github/workflows/e2e-mobile.yml |
| CI | Replace `curl \| bash` Maestro install with pinned version or checksum-verified install | .github/workflows/e2e-mobile.yml |
| CI | Pin `reactivecircus/android-emulator-runner` to full SHA | .github/workflows/e2e-mobile.yml |
| Config | Pin `bcrypt`, `jose`, `helmet` to exact versions (remove `^`) | packages/api/package.json |
| Config | Add `pnpm audit --audit-level=high` to pre-commit hook | .husky/pre-commit |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Workflows use least-privilege permissions
  Given I inspect each GitHub Actions workflow file
  Then each file should contain an explicit permissions block
  And no workflow should have write access beyond what is needed

Scenario: Maestro install is verified
  Given the e2e-mobile workflow runs
  When the Maestro CLI install step executes
  Then it should use a pinned version or verify the download checksum

Scenario: Security packages use exact versions
  Given I inspect packages/api/package.json
  Then bcrypt, jose, and helmet should use exact versions (no ^ or ~)
```
