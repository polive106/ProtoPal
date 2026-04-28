# E2-US35: Production Email Service Implementation

**User Story**: As a platform operator, I want a production-grade email service so that verification emails, password reset links, and other transactional emails are delivered to users securely rather than logged to the console or written to temporary files.

**Acceptance Criteria**:
- [ ] A new `SmtpEmailService` (or provider-specific service, e.g., SendGrid, SES) implements the `EmailService` port
- [ ] The email service factory in `services.module.ts` selects the production service when `NODE_ENV === 'production'`
- [ ] Email templates use HTML with plaintext fallback for verification and password reset emails
- [ ] Email delivery failures are logged but do not crash the request
- [ ] Email service configuration is driven by environment variables (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, or equivalent)
- [ ] Startup validation in production requires email configuration to be present
- [ ] `ConsoleEmailService` is only used in `test`, `PreviewEmailService` only in `development`
- [ ] No raw security tokens appear in email subject lines (tokens only in URL paths within the body)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Implement `SmtpEmailService` using nodemailer or provider SDK | packages/api/src/services/SmtpEmailService.ts |
| API | Add email HTML templates for verification and password reset | packages/api/src/services/email-templates/ |
| API | Update email service factory to include production provider | packages/api/src/modules/services.module.ts |
| API | Add email env var validation to `validateStartupEnv()` | packages/api/src/main.ts |
| API | Unit tests for SmtpEmailService (with mocked transport) | packages/api/src/services/SmtpEmailService.test.ts |
| API | Integration test verifying correct service is selected per environment | packages/api/src/modules/services.module.test.ts |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Production uses SMTP email service
  Given NODE_ENV is 'production'
  And SMTP_HOST and SMTP_USER are configured
  When the application starts
  Then the SmtpEmailService should be injected

Scenario: Production startup fails without email configuration
  Given NODE_ENV is 'production'
  And SMTP_HOST is not set
  When the application starts
  Then it should throw an error about missing email configuration

Scenario: Email delivery failure does not crash the request
  Given the SMTP server is unreachable
  When a user registers
  Then the registration should succeed
  And an error should be logged about email delivery failure

Scenario: Development uses PreviewEmailService
  Given NODE_ENV is 'development'
  When the application starts
  Then the PreviewEmailService should be injected

Scenario: Test uses ConsoleEmailService
  Given NODE_ENV is 'test'
  When the application starts
  Then the ConsoleEmailService should be injected
```
