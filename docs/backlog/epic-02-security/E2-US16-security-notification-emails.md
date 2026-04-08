# E2-US16: Security Notification Emails

**User Story**: As a user, I want to receive email notifications when security-sensitive changes happen on my account so that I can detect unauthorized access or credential compromise quickly.

**Acceptance Criteria**:
- [ ] User receives an email after a successful password reset confirming the change occurred
- [ ] User receives an email after a successful password reset from an unrecognized context (IP/timestamp included)
- [ ] Email includes timestamp and partial IP address for user awareness (e.g., "from IP 192.168.x.x")
- [ ] Email is sent asynchronously (does not block the API response)
- [ ] `EmailService` port extended with `sendPasswordChangedNotification` method
- [ ] Email content does not include any tokens, passwords, or clickable action links (informational only)
- [ ] Console email service logs the notification in development mode
- [ ] Unit tests verify the notification is triggered after password reset

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Add `sendPasswordChangedNotification(email, metadata)` to `EmailService` port | packages/domain/src/ports/EmailService.ts |
| Domain | Call notification in `ResetPassword` use-case after successful reset | packages/domain/src/use-cases/ResetPassword.ts |
| Domain | Add unit test verifying notification email is sent on password reset | packages/domain/src/use-cases/ResetPassword.test.ts |
| API | Implement `sendPasswordChangedNotification` in `ConsoleEmailService` | packages/api/src/services/ConsoleEmailService.ts |
| API | Implement `sendPasswordChangedNotification` in `PreviewEmailService` | packages/api/src/services/PreviewEmailService.ts |
| Tests | Unit tests for email service implementations | packages/api/src/services/*.test.ts |

**Dependencies**: E2-US06 (Done)

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Password reset triggers notification email
  Given a user has successfully reset their password
  When the password reset completes
  Then a password-changed notification email should be sent to the user's email address
  And the email should include the timestamp of the change

Scenario: Notification email does not contain sensitive data
  Given a password-changed notification email is generated
  Then it should NOT contain the new password
  And it should NOT contain any tokens or clickable links
  And it should include a partial IP address

Scenario: Notification email failure does not block password reset
  Given the email service fails to send
  When a user resets their password
  Then the password reset should still succeed
  And the failure should be logged
```
