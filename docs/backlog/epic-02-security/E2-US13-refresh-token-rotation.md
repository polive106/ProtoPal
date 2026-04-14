# E2-US13: Refresh Token Rotation & Short-Lived Access Tokens

**User Story**: As a platform operator, I want access tokens to be short-lived and paired with rotatable refresh tokens so that the damage window from a stolen token is minimized and compromised sessions can be detected via reuse detection.

**Acceptance Criteria**:
- [ ] Access tokens expire after 15 minutes (down from 24 hours)
- [ ] A refresh token (opaque, stored hashed in DB) is issued alongside the access token on login
- [ ] `POST /auth/refresh` accepts a valid refresh token and returns a new access/refresh token pair
- [ ] The old refresh token is invalidated on each rotation (one-time use)
- [ ] Reuse of a previously rotated refresh token invalidates the entire token family (reuse detection)
- [ ] Refresh tokens expire after 7 days of inactivity
- [ ] Web clients store the refresh token in an httpOnly secure cookie (separate from the access token cookie)
- [ ] Mobile clients continue to receive tokens in the response body and store them securely
- [ ] Cookie `maxAge` for the access token cookie is updated to match the shorter expiry
- [ ] Existing logout flow blacklists both access and refresh tokens
- [ ] Token cleanup job also removes expired refresh tokens

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Database | Add `refresh_tokens` table (id, user_id, token_hash, family_id, expires_at, revoked_at, created_at) | packages/database/src/schema.sqlite.ts |
| Database | Add `RefreshTokenRepository` adapter | packages/database/src/adapters/DrizzleRefreshTokenRepository.ts |
| Domain | Add `RefreshTokenRepository` port interface | packages/domain/src/ports/RefreshTokenRepository.ts |
| Domain | Add `RefreshAccessToken` use case with reuse detection | packages/domain/src/use-cases/RefreshAccessToken.ts |
| API | Reduce default JWT expiry from `24h` to `15m` | packages/api/src/services/JwtService.ts |
| API | Add `POST /auth/refresh` endpoint | packages/api/src/controllers/auth.controller.ts |
| API | Update login handler to issue refresh token alongside access token | packages/api/src/controllers/auth.controller.ts |
| API | Update logout to revoke refresh token family | packages/api/src/controllers/auth.controller.ts |
| API | Update cookie `maxAge` to 15 minutes for access token cookie | packages/api/src/controllers/auth.controller.ts |
| API | Add refresh token cookie with 7-day maxAge | packages/api/src/controllers/auth.controller.ts |
| Frontend | Add automatic token refresh on 401 response (retry interceptor) | packages/frontend/src/lib/api.ts |
| Mobile | Add automatic token refresh logic with stored refresh token | packages/mobile/src/lib/api.ts |
| API | Unit + integration tests for refresh flow and reuse detection | packages/api/src/controllers/auth.controller.integration.test.ts |
| E2E | Token refresh E2E test | e2e/tests/auth.api.spec.ts |

**Dependencies**: E2-US01

**Complexity**: L

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Login returns short-lived access token and refresh token
  Given valid user credentials
  When I log in
  Then the access token should expire in 15 minutes
  And a refresh token cookie should be set with 7-day maxAge

Scenario: Refresh token issues new token pair
  Given a valid refresh token
  When I call POST /auth/refresh
  Then I receive a new access token and refresh token
  And the old refresh token is no longer valid

Scenario: Reuse of rotated refresh token revokes the family
  Given refresh token A was already rotated to refresh token B
  When I use refresh token A again
  Then all tokens in that family should be revoked
  And I should receive a 401 Unauthorized

Scenario: Expired refresh token is rejected
  Given a refresh token that expired 8 days ago
  When I call POST /auth/refresh
  Then I should receive a 401 Unauthorized

Scenario: Logout revokes the refresh token family
  Given I am logged in with a valid session
  When I call POST /auth/logout
  Then my refresh token family should be revoked
  And neither access nor refresh tokens should work
```
