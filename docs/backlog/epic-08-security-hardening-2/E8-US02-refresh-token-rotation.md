# E8-US02: Short-Lived Access Tokens & Refresh Token Rotation

**User Story**: As a security-conscious user, I want access tokens to be short-lived with a secure refresh mechanism so that the damage window from a compromised token is minimized.

**Acceptance Criteria**:
- [ ] Access tokens expire in 15 minutes (configurable via env var)
- [ ] A refresh token is issued alongside the access token on login
- [ ] Refresh tokens are stored hashed in the database with expiration (7 days)
- [ ] `POST /auth/refresh` endpoint accepts a refresh token and returns a new access + refresh token pair
- [ ] Used refresh tokens are invalidated (rotation) to prevent replay
- [ ] Refresh token family tracking detects reuse and invalidates the entire family
- [ ] Frontend automatically refreshes tokens before expiry via interceptor
- [ ] Mobile app handles token refresh transparently
- [ ] Logout invalidates both access and refresh tokens
- [ ] Existing E2E auth tests still pass

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add `refresh_tokens` table (id, user_id, token_hash, family_id, expires_at, revoked_at, created_at) | packages/database/src/schema/schema.sqlite.ts, schema.postgres.ts |
| Database | RefreshToken repository adapter (Drizzle + Mongo) | packages/database/src/adapters/drizzle/DrizzleRefreshTokenRepository.ts |
| Domain | RefreshTokenRepository port | packages/domain/src/ports/RefreshTokenRepository.ts |
| Domain | RefreshToken entity | packages/domain/src/entities/RefreshToken.ts |
| Domain | RefreshToken use case with family rotation detection | packages/domain/src/use-cases/RefreshToken.ts |
| API | Update JwtService to support configurable short-lived access tokens | packages/api/src/services/JwtService.ts |
| API | Add `POST /auth/refresh` endpoint | packages/api/src/controllers/auth.controller.ts |
| API | Update login to issue refresh token (httpOnly cookie or response body for mobile) | packages/api/src/controllers/auth.controller.ts |
| API | Update logout to revoke refresh token family | packages/api/src/controllers/auth.controller.ts |
| Frontend | Add token refresh interceptor that refreshes before expiry | packages/frontend/src/lib/api.ts |
| Mobile | Add token refresh logic in auth provider | packages/mobile/src/providers/AuthProvider.tsx |
| API | Unit + integration tests for refresh flow | packages/api/src/controllers/auth.controller.integration.test.ts |
| E2E | Token refresh E2E test | e2e/tests/auth.api.spec.ts |

**Dependencies**: None

**Complexity**: L

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Access token expires after 15 minutes
  Given I log in and receive an access token
  When 16 minutes have elapsed
  Then the access token should be rejected with 401

Scenario: Refresh token issues new token pair
  Given I have a valid refresh token
  When I call POST /auth/refresh
  Then I should receive a new access token and refresh token
  And the old refresh token should be invalidated

Scenario: Reused refresh token triggers family revocation
  Given a refresh token has already been used
  When an attacker replays the old refresh token
  Then all tokens in the family should be revoked
  And the response should be 401

Scenario: Frontend transparently refreshes tokens
  Given my access token is about to expire
  When I make an API request
  Then the frontend should refresh the token before the request
  And the request should succeed

Scenario: Logout revokes refresh tokens
  Given I am logged in with valid tokens
  When I call POST /auth/logout
  Then both access and refresh tokens should be invalidated
```
