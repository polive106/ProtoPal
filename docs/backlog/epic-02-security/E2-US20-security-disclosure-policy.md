# E2-US20: Security Disclosure Policy

**User Story**: As a security researcher or community member, I want a clear vulnerability disclosure policy so that I know how to responsibly report security issues and what to expect in terms of response.

**Acceptance Criteria**:
- [ ] A `SECURITY.md` file exists in the repository root
- [ ] The file includes a supported versions table
- [ ] The file describes how to report a vulnerability (private channel, not public issue)
- [ ] The file sets response time expectations (e.g., acknowledgement within 48 hours)
- [ ] The file describes the disclosure timeline (e.g., 90-day coordinated disclosure)
- [ ] The file lists what is in-scope and out-of-scope for reports
- [ ] GitHub repository security settings point to the SECURITY.md file

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Docs | Create `SECURITY.md` with disclosure policy | SECURITY.md |
| Config | Enable GitHub private vulnerability reporting in repository settings | .github/ |

**Dependencies**: None

**Complexity**: XS

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: SECURITY.md exists and is accessible
  Given the repository is cloned
  When I look at the root directory
  Then SECURITY.md should exist
  And it should contain sections for reporting, scope, and timeline

Scenario: GitHub security tab links to policy
  Given I visit the repository on GitHub
  When I click the "Security" tab
  Then the vulnerability disclosure policy should be visible
```
