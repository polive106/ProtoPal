# E2-US14: Command Injection Fix in Email Preview Service

**User Story**: As a developer, I want the email preview service to use safe subprocess execution so that shell metacharacter injection is not possible, even in development environments.

**Acceptance Criteria**:
- [ ] `PreviewEmailService` uses `execFile()` instead of `exec()` to avoid shell interpretation
- [ ] File path arguments are passed as array parameters, not interpolated into a shell string
- [ ] Email addresses are HTML-escaped before embedding in email HTML templates (prevents XSS in email clients)
- [ ] Sensitive tokens/URLs are not logged to stdout (use debug-level structured logging or remove)
- [ ] Unit tests verify that special characters in email addresses are properly escaped
- [ ] Unit tests verify `execFile` is called instead of `exec`

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Replace `exec()` with `execFile()` and pass filePath as argument array | packages/api/src/services/PreviewEmailService.ts:51,99 |
| API | HTML-escape `email` parameter before embedding in HTML template strings | packages/api/src/services/PreviewEmailService.ts:35,83 |
| API | Remove `console.log` of verification/reset URLs and tokens | packages/api/src/services/PreviewEmailService.ts:59,107 |
| API | Remove `console.log` of verification tokens from auth controller dev blocks | packages/api/src/controllers/auth.controller.ts:112,176 |
| API | Remove token logging from `ConsoleEmailService` | packages/api/src/services/ConsoleEmailService.ts:6,11 |
| API | Add unit tests for HTML escaping and safe subprocess execution | packages/api/src/services/PreviewEmailService.test.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Email with special characters is safely rendered
  Given a user registers with email "<script>alert('xss')</script>@example.com"
  When the verification email HTML is generated
  Then the email address should be HTML-escaped in the output
  And no raw HTML tags from the email should appear unescaped

Scenario: File is opened with execFile not exec
  Given the email preview service generates an HTML file
  When it opens the file in the browser
  Then execFile should be called with the command and file path as separate arguments
  And exec with shell interpolation should not be used

Scenario: Tokens are not logged to console
  Given a verification email is sent in development
  When I capture stdout
  Then no verification token values should appear in the output
  And no reset token values should appear in the output
```
