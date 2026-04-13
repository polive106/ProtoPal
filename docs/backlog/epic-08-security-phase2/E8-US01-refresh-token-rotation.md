# E8-US01: Refresh Token Rotation

**User Story**: As a platform operator, I want short-lived access tokens with refresh token rotation so that stolen tokens have minimal impact and sessions can be managed securely.

**Security Finding**: The current JWT access tokens are valid for 24 hours with no refresh mechanism. If a token is compromised (via XSS, log exposure, or network interception), an attacker has full access for 24 hours. Industry best practice is short-lived access tokens (15 minutes) combined with refresh token rotation.

**Current State**:
- `packages/api/src/services/JwtService.ts` — access token expires in 24h (line 22)
- `packages/api/src/controllers/auth.controller.ts` — cookie maxAge is 24h (line 224)
- No refresh token table or endpoint exists
- Token version check happens on every request but tokens are long-lived

**Acceptance Criteria**:
- [ ] Access tokens expire in 15 minutes (configurable via `ACCESS_TOKEN_EXPIRY` env var)
- [ ] Refresh tokens are generated on login, stored in database with hashed value, and have a 7-day expiry
- [ ] A `POST /auth/refresh` endpoint exchanges a valid refresh token for a new access + refresh token pair
- [ ] Old refresh tokens are invalidated on rotation (one-time use)
- [ ] Refresh token reuse is detected and all tokens for the user are revoked (replay detection)
- [ ] Web clients receive refresh token in a separate httpOnly cookie (`refresh_token`)
- [ ] Mobile clients receive refresh token in login response and store it in secure storage
- [ ] Frontend and mobile `api.ts` libraries automatically refresh tokens on 401 responses
- [ ] Token blacklist entries use the shorter access token TTL
- [ ] Existing tests updated for new auth flow

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Add `RefreshToken` entity and `RefreshTokenRepository` port | packages/domain/src/entities/, packages/domain/src/ports/ |
| Database | Add `refresh_tokens` table (id, user_id, token_hash, expires_at, revoked_at, replaced_by, created_at) | packages/database/src/schema/ |
| Database | Implement `DrizzleRefreshTokenRepository` adapter | packages/database/src/adapters/drizzle/ |
| Database | Implement `MongoRefreshTokenRepository` adapter | packages/database/src/adapters/mongo/ |
| API | Add `POST /auth/refresh` endpoint with refresh token rotation | packages/api/src/controllers/auth.controller.ts |
| API | Update login to generate and return refresh token | packages/api/src/controllers/auth.controller.ts |
| API | Update JwtService to accept configurable short expiry | packages/api/src/services/JwtService.ts |
| API | Add refresh token cleanup to TokenCleanupService | packages/api/src/services/TokenCleanupService.ts |
| Frontend | Add automatic token refresh on 401 in `api.ts` | packages/frontend/src/lib/api.ts |
| Mobile | Add automatic token refresh and refresh token secure storage | packages/mobile/src/lib/api.ts, packages/mobile/src/providers/AuthProvider.tsx |
| Database | Update seed script for new table | packages/database/src/seed.ts |
| Domain | Unit tests for refresh token use case | packages/domain/src/use-cases/ |
| API | Integration tests for refresh endpoint | packages/api/src/controllers/ |
| E2E | Token refresh E2E test | e2e/tests/ |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Access token expires and refresh token issues new pair
  Given I am logged in with a valid access token
  When the access token expires
  And I call POST /auth/refresh with my refresh token
  Then I receive a new access token and refresh token
  And the old refresh token is invalidated

Scenario: Reused refresh token triggers full revocation
  Given I have a refresh token that has already been rotated
  When I attempt to use the old refresh token
  Then I receive a 401 Unauthorized
  And all refresh tokens for the user are revoked

Scenario: Frontend automatically refreshes on 401
  Given my access token has expired
  When I make an API request that returns 401
  Then the frontend automatically calls /auth/refresh
  And retries the original request with the new token
```
