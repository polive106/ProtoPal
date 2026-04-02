# E2-US06: Password Reset Flow

**User Story**: As a user, I want to reset my password via email so that I can recover access to my account if I forget my credentials.

**Acceptance Criteria**:
- [ ] `POST /auth/forgot-password` accepts an email and sends a reset link
- [ ] Reset tokens are hashed before storage (not stored in plaintext)
- [ ] Reset tokens expire after 1 hour
- [ ] `POST /auth/reset-password` accepts token + new password and updates the account
- [ ] Used/expired tokens are rejected
- [ ] Requesting a reset for a non-existent email returns 200 (no user enumeration)
- [ ] All existing sessions are invalidated after password reset
- [ ] Frontend has forgot-password and reset-password pages
- [ ] Rate limiting on forgot-password (3 requests/hour per email)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add `password_reset_tokens` table (id, user_id, token_hash, expires_at, used_at, created_at) | packages/database/src/schema.sqlite.ts |
| Database | PasswordResetTokenRepository adapter | packages/database/src/adapters/DrizzlePasswordResetTokenRepository.ts |
| Domain | PasswordResetTokenRepository port | packages/domain/src/ports/PasswordResetTokenRepository.ts |
| Domain | RequestPasswordReset use case | packages/domain/src/use-cases/RequestPasswordReset.ts |
| Domain | ResetPassword use case | packages/domain/src/use-cases/ResetPassword.ts |
| API | `POST /auth/forgot-password` endpoint | packages/api/src/controllers/auth.controller.ts |
| API | `POST /auth/reset-password` endpoint | packages/api/src/controllers/auth.controller.ts |
| API | Rate limit on forgot-password | packages/api/src/controllers/auth.controller.ts |
| Frontend | Forgot password page | packages/frontend/src/routes/forgot-password.tsx |
| Frontend | Reset password page | packages/frontend/src/routes/reset-password.tsx |
| Frontend | Link from login page to forgot password | packages/frontend/src/features/auth/ |
| Domain | Unit tests for use cases | packages/domain/src/use-cases/RequestPasswordReset.test.ts, packages/domain/src/use-cases/ResetPassword.test.ts |
| API | Integration tests | packages/api/src/controllers/auth.controller.integration.test.ts |
| E2E | Password reset flow test | e2e/tests/auth.api.spec.ts |

**Dependencies**: E2-US02 (email service)

**Complexity**: L

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Request password reset
  Given a user with email "user@example.com" exists
  When I call POST /auth/forgot-password with that email
  Then I should receive 200 OK
  And a reset email should be sent

Scenario: No enumeration on unknown email
  Given no user with email "unknown@example.com" exists
  When I call POST /auth/forgot-password with that email
  Then I should still receive 200 OK
  And no email should be sent

Scenario: Reset password with valid token
  Given I have a valid password reset token
  When I call POST /auth/reset-password with the token and a new password
  Then my password should be updated
  And all existing sessions should be invalidated

Scenario: Expired token is rejected
  Given I have a reset token that expired 2 hours ago
  When I call POST /auth/reset-password with the token
  Then I should receive 400 Bad Request
```
