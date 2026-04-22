# E2-US28: Command Injection Prevention in Email Service

**User Story**: As a security-conscious developer, I want the email preview service to use safe process-spawning APIs so that template string interpolation in shell commands cannot be exploited for command injection.

**Acceptance Criteria**:
- [ ] `PreviewEmailService` uses `execFile()` (or `spawn()`) with argument arrays instead of `exec()` with template strings
- [ ] The file path is never interpolated into a shell command string
- [ ] Existing email preview functionality still works in development
- [ ] A unit test verifies that `execFile` is called with an array argument (not a concatenated string)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Replace `exec(\`${openCmd} "${filePath}"\`)` with `execFile(openCmd, [filePath])` in both methods | packages/api/src/services/PreviewEmailService.ts |
| API | Unit test verifying safe process spawning | packages/api/src/services/PreviewEmailService.test.ts |

**Dependencies**: None

**Complexity**: XS

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Email preview opens file without shell interpolation
  Given I call sendVerificationEmail
  When the email HTML is written to a temp file
  Then execFile should be called with the command and file path as separate arguments
  And no shell string interpolation should occur

Scenario: Email preview handles special characters in file paths safely
  Given the temp directory path contains spaces or special characters
  When the email preview is triggered
  Then the file should still open correctly without command injection
```
