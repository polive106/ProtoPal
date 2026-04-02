# E2-US02: Registration Flow & Email Verification

**User Story**: As a platform operator, I want new accounts to require email verification before gaining access so that only legitimate users can use the system.

**Acceptance Criteria**:
- [ ] New users are created with `status: 'pending'` instead of `'approved'`
- [ ] A verification token is generated and stored on registration
- [ ] A verification email is sent with a time-limited link
- [ ] `GET /auth/verify?token=...` endpoint verifies the token and sets status to `'approved'`
- [ ] Login rejects users with `status: 'pending'` with a clear message
- [ ] Expired verification tokens are rejected
- [ ] Users can request a new verification email via `POST /auth/resend-verification`
- [ ] Frontend shows appropriate messaging for pending accounts

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Change RegisterUser to set status to `'pending'` | packages/domain/src/use-cases/RegisterUser.ts |
| Domain | EmailVerification port (send, verify) | packages/domain/src/ports/EmailService.ts |
| Database | Add `verification_tokens` table (id, user_id, token_hash, expires_at, created_at) | packages/database/src/schema.sqlite.ts |
| Database | VerificationToken repository adapter | packages/database/src/adapters/DrizzleVerificationTokenRepository.ts |
| API | Email service implementation (pluggable: console in dev, SMTP in prod) | packages/api/src/services/EmailService.ts |
| API | `GET /auth/verify` endpoint | packages/api/src/controllers/auth.controller.ts |
| API | `POST /auth/resend-verification` endpoint | packages/api/src/controllers/auth.controller.ts |
| API | Update RegisterUser controller to trigger verification email | packages/api/src/controllers/auth.controller.ts |
| Frontend | Post-registration "check your email" screen | packages/frontend/src/features/auth/ |
| Frontend | Verification landing page | packages/frontend/src/routes/verify.tsx |
| API | Unit + integration tests | packages/domain/src/use-cases/RegisterUser.test.ts, packages/api/src/controllers/auth.controller.integration.test.ts |
| E2E | Verification flow test | e2e/tests/auth.api.spec.ts |

**Dependencies**: None

**Complexity**: L

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Registration creates a pending account
  Given I register with valid credentials
  When I try to log in
  Then I should receive a 401 with message "Please verify your email"

Scenario: Email verification activates the account
  Given I registered and received a verification token
  When I call GET /auth/verify?token=<valid-token>
  Then my account status should be 'approved'
  And I should be able to log in

Scenario: Expired verification token is rejected
  Given I have a verification token that expired 25 hours ago
  When I call GET /auth/verify?token=<expired-token>
  Then I should receive a 400 Bad Request

Scenario: Resend verification email
  Given I have a pending account
  When I call POST /auth/resend-verification with my email
  Then a new verification token should be generated
  And the old token should be invalidated
```
