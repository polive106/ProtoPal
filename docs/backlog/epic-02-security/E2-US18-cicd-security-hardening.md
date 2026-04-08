# E2-US18: CI/CD Security Hardening

**User Story**: As a platform operator, I want the CI/CD pipeline hardened against supply chain attacks and misconfiguration so that build and deployment workflows cannot be exploited to inject malicious code or leak secrets.

**Acceptance Criteria**:
- [ ] All GitHub Actions are pinned to full commit SHAs instead of mutable tags (e.g., `actions/checkout@a5ac7e...` instead of `@v4`)
- [ ] All workflow files declare explicit `permissions` blocks with least-privilege scopes
- [ ] A `CODEOWNERS` file protects security-sensitive paths (workflows, auth code, database schema)
- [ ] Workflows use `pull_request` event (not `pull_request_target`) to prevent fork-based attacks
- [ ] No secrets are printed or echoed in workflow steps
- [ ] Workflow artifacts (test reports, build outputs) have appropriate retention periods
- [ ] Branch protection rules documented for main branch (require reviews, status checks)
- [ ] A comment is added to each pinned SHA referencing the tag for readability

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| CI | Pin all actions to commit SHAs with tag comments | .github/workflows/test.yml |
| CI | Pin all actions to commit SHAs with tag comments | .github/workflows/e2e.yml |
| CI | Pin all actions to commit SHAs with tag comments | .github/workflows/e2e-mobile.yml |
| CI | Add explicit `permissions: { contents: read }` to all workflows | .github/workflows/*.yml |
| Config | Create CODEOWNERS file protecting critical paths | .github/CODEOWNERS |
| CI | Verify no `pull_request_target` triggers are used | .github/workflows/*.yml |
| CI | Add `concurrency` groups to prevent duplicate runs | .github/workflows/*.yml |
| Docs | Document required branch protection rules | docs/security.md |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: All actions pinned to commit SHAs
  Given the workflow files in .github/workflows/
  When I inspect all `uses:` directives
  Then every action should reference a full 40-character commit SHA
  And a comment should indicate the corresponding version tag

Scenario: Explicit permissions declared
  Given the workflow files in .github/workflows/
  When I inspect the top-level or job-level permissions
  Then each workflow should have an explicit permissions block
  And no workflow should use default (write-all) permissions

Scenario: CODEOWNERS protects security paths
  Given the CODEOWNERS file exists
  When a PR modifies .github/workflows/ or packages/api/src/common/guards/
  Then the designated security reviewers should be auto-requested
```
