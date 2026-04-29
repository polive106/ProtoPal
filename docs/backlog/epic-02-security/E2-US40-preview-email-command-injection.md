# E2-US40: PreviewEmailService Command Injection Fix

**User Story**: As a security-conscious developer, I want the email preview service to use safe process execution so that file paths cannot be exploited for shell command injection during development.

**Acceptance Criteria**:
- [ ] `PreviewEmailService` uses `execFile()` (with argument array) instead of `exec()` (with string interpolation)
- [ ] File paths are not interpolated into shell command strings
- [ ] The fix does not break the email preview workflow in development
- [ ] Unit test verifies `execFile` is called instead of `exec`

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Replace `exec(\`${openCmd} "${filePath}"\`)` with `execFile(openCmd, [filePath])` | packages/api/src/services/PreviewEmailService.ts |
| API | Unit test verifying safe execution method | packages/api/src/services/PreviewEmailService.test.ts |

**Dependencies**: None

**Complexity**: XS

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Email preview opens file safely
  Given a verification email is sent in development mode
  When PreviewEmailService opens the HTML file
  Then execFile is called with the command and file path as separate arguments
  And no shell interpolation occurs
```
