# E2-US32: GitHub Actions Supply Chain Hardening

**User Story**: As a platform operator, I want GitHub Actions workflows to use SHA-pinned action versions and minimal permissions so that a compromised upstream action cannot inject malicious code into CI/CD runs.

**Acceptance Criteria**:
- [ ] All GitHub Actions in all workflow files are pinned to full commit SHAs (not version tags like `@v4`)
- [ ] Each workflow file declares an explicit `permissions:` block with minimal required permissions
- [ ] Test and E2E workflows use `permissions: { contents: read }`
- [ ] Security audit workflow uses `permissions: { contents: read, issues: write }`
- [ ] Third-party actions (e.g., `reactivecircus/android-emulator-runner`) are pinned to SHA
- [ ] Dependabot's `github-actions` ecosystem updates continue to work with SHA-pinned actions
- [ ] A comment with the version tag is added after each SHA for readability (e.g., `actions/checkout@abc123 # v4`)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| CI | Pin all actions to SHA in test.yml | .github/workflows/test.yml |
| CI | Pin all actions to SHA in e2e.yml | .github/workflows/e2e.yml |
| CI | Pin all actions to SHA in e2e-mobile.yml | .github/workflows/e2e-mobile.yml |
| CI | Pin all actions to SHA in security-audit.yml | .github/workflows/security-audit.yml |
| CI | Add `permissions:` block to all workflow files | .github/workflows/*.yml |
| CI | Verify Dependabot still creates update PRs for SHA-pinned actions | .github/dependabot.yml |

**Dependencies**: E2-US12

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: All actions are SHA-pinned
  Given I inspect all workflow files in .github/workflows/
  When I search for action references (uses:)
  Then every action should reference a full 40-character SHA
  And a version comment should follow each SHA

Scenario: Workflow permissions are minimal
  Given I inspect all workflow files
  When I check the permissions block
  Then test.yml should have contents: read
  And security-audit.yml should have contents: read and issues: write

Scenario: Dependabot updates SHA-pinned actions
  Given Dependabot runs its weekly GitHub Actions check
  When a new version of an action is available
  Then Dependabot should create a PR updating the SHA
```
