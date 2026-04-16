# E2-US26: Token Input Length Validation

**User Story**: As a platform operator, I want all token input fields (verification tokens, password reset tokens) to have maximum length constraints so that attackers cannot submit extremely long strings that waste server resources during hashing and database lookups.

**Acceptance Criteria**:
- [ ] `verifySchema` token field has a `.max()` constraint (e.g., 256 characters)
- [ ] `resetPasswordSchema` token field has a `.max()` constraint (e.g., 256 characters)
- [ ] The max length is based on the actual token format (hex-encoded SHA256 = 64 chars, with margin for URL encoding)
- [ ] Requests with oversized tokens receive a 400 Bad Request with a clear validation error
- [ ] The shared constants file includes a `TOKEN_MAX` constant used by both schemas
- [ ] Domain-layer token validation also enforces the max length before hashing

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Shared | Add `TOKEN_MAX` constant to `INPUT_LIMITS` | packages/shared/src/constants.ts |
| API | Add `.max(INPUT_LIMITS.TOKEN_MAX)` to `verifySchema` token field | packages/api/src/controllers/dto/auth.dto.ts |
| API | Add `.max(INPUT_LIMITS.TOKEN_MAX)` to `resetPasswordSchema` token field | packages/api/src/controllers/dto/auth.dto.ts |
| Domain | Add length check before hashing in `VerifyEmail` use case | packages/domain/src/use-cases/VerifyEmail.ts |
| Domain | Add length check before hashing in `ResetPassword` use case | packages/domain/src/use-cases/ResetPassword.ts |
| API | Unit tests for oversized token rejection | packages/api/src/controllers/auth.controller.test.ts |
| Domain | Unit tests for token length validation | packages/domain/src/use-cases/VerifyEmail.test.ts |

**Dependencies**: None

**Complexity**: XS

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Oversized verification token is rejected
  Given a token string of 1000 characters
  When I call POST /auth/verify with this token
  Then the response should be 400 Bad Request
  And the error should mention the maximum allowed length

Scenario: Oversized reset token is rejected
  Given a token string of 1000 characters
  When I call POST /auth/reset-password with this token and a valid password
  Then the response should be 400 Bad Request

Scenario: Normal-length tokens still work
  Given a valid 64-character hex token
  When I call POST /auth/verify with this token
  Then the request should be processed normally (success or invalid token, not length error)
```
