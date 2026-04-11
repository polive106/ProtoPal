# E8-US02: Token & Parameter Schema Hardening

**User Story**: As a security engineer, I want all token and parameter inputs to have strict length bounds and format validation so that unbounded inputs cannot cause denial-of-service or bypass security controls.

**Acceptance Criteria**:
- [ ] Password reset token schema enforces a maximum length (e.g., 256 characters)
- [ ] Email verification token schema enforces a maximum length (e.g., 256 characters)
- [ ] Admin unlock endpoint validates the `email` path parameter with Zod email schema
- [ ] Domain-layer email regex is aligned with (or defers to) the stricter Zod `.email()` validation
- [ ] Existing tests pass; new tests cover the added constraints

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `.max(256)` to `resetPasswordSchema.token` field | packages/api/src/controllers/dto/auth.dto.ts |
| API | Add `.max(256)` to `verifySchema.token` field | packages/api/src/controllers/dto/auth.dto.ts |
| API | Add Zod validation pipe for `@Param('email')` on admin unlock endpoint | packages/api/src/controllers/admin.controller.ts |
| Domain | Replace simplistic email regex with stricter validation or document that API-layer Zod handles it | packages/domain/src/use-cases/RegisterUser.ts |
| API | Add unit tests for token max-length rejection | packages/api/src/controllers/auth.controller.integration.test.ts |
| API | Add unit test for admin email param validation | packages/api/src/controllers/admin.controller.test.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Security Context**:
- **Severity**: Medium
- **Files**: `packages/api/src/controllers/dto/auth.dto.ts` (Lines 40-41), `packages/api/src/controllers/admin.controller.ts` (Line 27), `packages/domain/src/use-cases/RegisterUser.ts` (Line 87)
- **Issues**:
  1. `resetPasswordSchema` and `verifySchema` accept `z.string().min(1)` with no upper bound — an attacker could send arbitrarily large token strings causing memory/CPU exhaustion during hashing and comparison.
  2. The admin unlock endpoint extracts `@Param('email')` without any format validation — any string is passed directly to the database query.
  3. The domain layer uses a simplistic regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) that accepts malformed emails like `a@b.c`, while the API layer uses stricter Zod `.email()` validation — this inconsistency could cause confusion.

**Test Scenarios**:
```gherkin
Scenario: Reject oversized reset token
  Given a password reset request with a token exceeding 256 characters
  When I call POST /auth/reset-password
  Then I should receive a 400 Bad Request with a validation error

Scenario: Reject oversized verification token
  Given a verification request with a token exceeding 256 characters
  When I call POST /auth/verify
  Then I should receive a 400 Bad Request with a validation error

Scenario: Reject invalid email on admin unlock
  Given I am authenticated as an admin
  When I call POST /admin/unlock/not-an-email
  Then I should receive a 400 Bad Request with a validation error

Scenario: Reject malformed email in domain layer
  Given a registration attempt with email "a@b.c"
  When the domain validates the email
  Then it should reject the malformed email
```
