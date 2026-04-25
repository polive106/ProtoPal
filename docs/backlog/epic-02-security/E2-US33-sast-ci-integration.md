# E2-US33: Static Application Security Testing (SAST) in CI

**User Story**: As a platform operator, I want automated static application security testing in CI so that code-level vulnerabilities (injection, insecure patterns, secret leaks) are caught before they reach production.

**Acceptance Criteria**:
- [ ] GitHub CodeQL or Semgrep is configured as a CI workflow step
- [ ] SAST scans run on every push and pull request
- [ ] SAST covers TypeScript/JavaScript source files across all packages
- [ ] A secrets scanner (e.g., `gitleaks` or `trufflehog`) replaces or supplements the current grep-based password scan
- [ ] CI fails on high-severity SAST findings
- [ ] Medium-severity findings are reported as PR annotations (non-blocking)
- [ ] SAST results are uploaded to GitHub Security tab (if using CodeQL)
- [ ] False positive suppression mechanism is documented

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| CI | Add CodeQL or Semgrep workflow for TypeScript analysis | .github/workflows/codeql.yml or .github/workflows/sast.yml |
| CI | Configure SAST to scan all packages/**/*.ts and packages/**/*.tsx | .github/workflows/sast.yml |
| CI | Add gitleaks or trufflehog step to replace grep-based secret scan | .github/workflows/security-audit.yml |
| CI | Configure severity thresholds (fail on high, warn on medium) | .github/workflows/sast.yml |
| Docs | Document false positive suppression (inline comments or config) | docs/security/sast-config.md |

**Dependencies**: E2-US12

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: SAST runs on pull request
  Given a PR is opened with TypeScript changes
  When CI runs
  Then the SAST workflow should execute and report results

Scenario: High-severity finding blocks merge
  Given a PR introduces a code pattern flagged as high severity
  When the SAST scan completes
  Then the CI check should fail
  And the finding should appear as a PR annotation

Scenario: Secrets scanner detects leaked credentials
  Given a PR accidentally includes a hardcoded API key
  When the secrets scan runs
  Then it should detect and report the leaked secret
  And the CI check should fail

Scenario: Clean code passes SAST
  Given a PR with no security issues
  When the SAST scan completes
  Then the CI check should pass
```
