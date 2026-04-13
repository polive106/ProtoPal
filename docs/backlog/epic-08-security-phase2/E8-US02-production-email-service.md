# E8-US02: Production Email Service Integration

**User Story**: As a platform operator, I want a real email delivery service for production so that verification emails and password reset links are actually sent to users, and sensitive tokens are not logged to stdout.

**Security Finding**: The application only has two email service implementations:
- `ConsoleEmailService` — logs raw verification/password reset tokens to stdout (`packages/api/src/services/ConsoleEmailService.ts` lines 6, 11)
- `PreviewEmailService` — writes tokens to temp HTML files and logs them to stdout (`packages/api/src/services/PreviewEmailService.ts` lines 59, 107)

Neither sends actual emails. In any deployed environment (staging, production), verification and password reset flows are non-functional, and sensitive tokens are exposed in server logs which may be aggregated and accessible to operations staff.

**Current State**:
- `packages/api/src/modules/services.module.ts` lines 24-29 — selects ConsoleEmailService for test, PreviewEmailService for everything else
- No SMTP, SendGrid, SES, or Resend integration exists
- `packages/domain/src/ports/EmailService.ts` — defines the port interface

**Acceptance Criteria**:
- [ ] A production-grade `SmtpEmailService` (or provider-specific service like SendGrid/Resend) implements the `EmailService` port
- [ ] Email service selection is environment-based: Console for test, Preview for development, SMTP/provider for production
- [ ] `EMAIL_PROVIDER` env var controls the email service (`console`, `preview`, `smtp`)
- [ ] SMTP configuration via env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- [ ] Startup validation fails fast if production env is missing email configuration
- [ ] Tokens are NEVER logged to stdout in production
- [ ] Email templates include proper branding and unsubscribe links
- [ ] Failed email delivery is logged as an audit event (without exposing the token)
- [ ] Unit tests for the new email service (with mocked SMTP transport)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Implement `SmtpEmailService` using nodemailer or similar | packages/api/src/services/SmtpEmailService.ts |
| API | Update ServicesModule to select email service based on `EMAIL_PROVIDER` | packages/api/src/modules/services.module.ts |
| API | Add email env var validation to `validateStartupEnv()` for production | packages/api/src/main.ts |
| API | Add email delivery failure audit logging | packages/api/src/services/SmtpEmailService.ts |
| API | Remove token logging from ConsoleEmailService or gate behind test-only | packages/api/src/services/ConsoleEmailService.ts |
| API | Unit tests for SmtpEmailService | packages/api/src/services/SmtpEmailService.test.ts |
| Shared | Add `EMAIL_PROVIDER` to `.env.example` with documentation | .env.example |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Production requires email configuration
  Given NODE_ENV is 'production'
  And EMAIL_PROVIDER is 'smtp'
  And SMTP_HOST is not set
  When the application starts
  Then it should throw a fatal error about missing SMTP configuration

Scenario: Verification email is sent via SMTP in production
  Given EMAIL_PROVIDER is 'smtp' with valid SMTP credentials
  When a user registers
  Then a verification email is sent via the SMTP transport
  And the token is NOT logged to stdout

Scenario: Email delivery failure is logged
  Given the SMTP server is unreachable
  When a verification email is attempted
  Then an audit log entry is created with action EMAIL_DELIVERY_FAILED
  And the token is NOT included in the log entry
```
