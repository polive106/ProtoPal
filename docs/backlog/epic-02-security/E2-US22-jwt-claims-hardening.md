# E2-US22: JWT Claims Hardening

**User Story**: As a platform operator, I want JWT tokens to include standard claims (jti, iss, aud) so that tokens are uniquely identifiable for revocation, bound to the issuing service, and cannot be replayed against unintended audiences.

**Acceptance Criteria**:
- [ ] Every issued JWT includes a `jti` (JWT ID) claim containing a unique UUID
- [ ] Every issued JWT includes an `iss` (issuer) claim matching the application's configured issuer URL
- [ ] Every issued JWT includes an `aud` (audience) claim matching the application's configured audience identifier
- [ ] `AuthGuard` verifies the `iss` and `aud` claims during token validation (rejects mismatches)
- [ ] The `iss` and `aud` values are configurable via environment variables with sensible defaults
- [ ] Token blacklist can reference tokens by `jti` in addition to token hash for more efficient revocation
- [ ] Existing tokens without these claims are gracefully rejected with a clear "token expired/invalid" message
- [ ] Unit tests verify claim presence and validation
- [ ] Mobile clients continue to work with the updated token format

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `JWT_ISSUER` and `JWT_AUDIENCE` env vars with defaults | packages/api/src/main.ts |
| API | Include `jti` (uuid), `iss`, and `aud` claims in token generation | packages/api/src/services/JwtService.ts |
| API | Validate `iss` and `aud` claims during `verify()` | packages/api/src/services/JwtService.ts |
| API | Update AuthGuard to handle tokens missing new claims (reject gracefully) | packages/api/src/common/guards/auth.guard.ts |
| API | Add `jti` to audit log metadata for login events | packages/api/src/controllers/auth.controller.ts |
| API | Unit tests for claim generation and validation | packages/api/src/services/JwtService.test.ts |
| API | Integration tests for token rejection with wrong iss/aud | packages/api/src/common/guards/auth.guard.test.ts |
| E2E | Verify login/logout flows work with updated token format | e2e/tests/auth.api.spec.ts |

**Dependencies**: E2-US01

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Issued JWT contains standard claims
  Given a user logs in successfully
  When I decode the JWT
  Then it should contain a unique "jti" claim
  And it should contain the configured "iss" claim
  And it should contain the configured "aud" claim

Scenario: Token with wrong issuer is rejected
  Given a JWT was issued by a different service (wrong iss)
  When I make an authenticated request
  Then I should receive 401 Unauthorized

Scenario: Token with wrong audience is rejected
  Given a JWT has an audience claim for a different service
  When I make an authenticated request
  Then I should receive 401 Unauthorized

Scenario: Token without standard claims is rejected
  Given a JWT was issued before the claims upgrade (no jti/iss/aud)
  When I make an authenticated request
  Then I should receive 401 Unauthorized with a clear error message
```
