# E2-US17: Token Refresh & Session Lifecycle Management

**User Story**: As a user, I want my session to be seamlessly extended while I'm active without requiring re-login so that I have a good experience, while inactive sessions expire quickly to reduce the window of token theft.

**Acceptance Criteria**:
- [ ] Access token expiry is reduced from 24 hours to 15 minutes
- [ ] A refresh token (opaque, stored in DB) is issued alongside the access token on login
- [ ] `POST /auth/refresh` endpoint accepts a refresh token and returns a new access/refresh token pair
- [ ] Refresh tokens are stored as hashed values in a new `refresh_tokens` table with expiry (7 days)
- [ ] Refresh tokens are single-use (rotated on each refresh) to detect token theft
- [ ] If a previously-used refresh token is presented, all refresh tokens for that user are revoked (theft detection)
- [ ] Refresh token cookie is HTTP-only, secure, SameSite=strict, path restricted to `/api/auth/refresh`
- [ ] Logout revokes all refresh tokens for the user
- [ ] Frontend automatically refreshes the access token before expiry using a background interval or interceptor
- [ ] Mobile app refreshes tokens using secure storage for the refresh token
- [ ] Unit tests for refresh token rotation, theft detection, and expiry
- [ ] E2E tests for the full refresh flow

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Create `RefreshToken` entity and `RefreshTokenRepository` port | packages/domain/src/entities/RefreshToken.ts, packages/domain/src/ports/RefreshTokenRepository.ts |
| Domain | Create `RefreshSession` use case (validate, rotate, detect theft) | packages/domain/src/use-cases/RefreshSession.ts |
| Database | Create `refresh_tokens` table schema (id, userId, tokenHash, familyId, expiresAt, usedAt, createdAt) | packages/database/src/schema.sqlite.ts, packages/database/src/schema.postgres.ts |
| Database | Create migration for `refresh_tokens` table | packages/database/src/migrations/ |
| Database | Implement `DrizzleRefreshTokenRepository` | packages/database/src/adapters/DrizzleRefreshTokenRepository.ts |
| API | Reduce access token expiry to 15 minutes | packages/api/src/services/JwtService.ts |
| API | Issue refresh token on login, set as separate cookie | packages/api/src/controllers/auth.controller.ts |
| API | Add `POST /auth/refresh` endpoint | packages/api/src/controllers/auth.controller.ts |
| API | Revoke refresh tokens on logout | packages/api/src/controllers/auth.controller.ts |
| Frontend | Add token refresh interceptor/interval | packages/frontend/src/lib/api.ts |
| Frontend | Handle 401 responses by attempting refresh before redirecting to login | packages/frontend/src/lib/api.ts |
| Mobile | Add refresh token storage and refresh logic | packages/mobile/src/providers/AuthProvider.tsx |
| Domain | Unit tests for RefreshSession (rotation, theft detection, expiry) | packages/domain/src/use-cases/RefreshSession.test.ts |
| API | Integration tests for refresh endpoint | packages/api/src/controllers/auth.controller.integration.test.ts |
| E2E | Test full refresh flow (login, wait, refresh, continue) | e2e/tests/auth/refresh.spec.ts |

**Dependencies**: E2-US01, E2-US13

**Complexity**: L

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Access token expires after 15 minutes
  Given a user logs in and receives an access token
  When 16 minutes pass
  Then the access token is rejected with 401

Scenario: Refresh token returns new token pair
  Given a user has a valid refresh token
  When they POST /auth/refresh
  Then they receive a new access token and a new refresh token
  And the old refresh token is invalidated

Scenario: Reused refresh token triggers theft detection
  Given a refresh token has already been used once
  When the same refresh token is presented again
  Then all refresh tokens for that user are revoked
  And the response is 401 Unauthorized

Scenario: Expired refresh token is rejected
  Given a refresh token that expired 8 days ago
  When it is presented to POST /auth/refresh
  Then the response is 401 Unauthorized

Scenario: Logout revokes all refresh tokens
  Given a user has active refresh tokens
  When they POST /auth/logout
  Then all refresh tokens for that user are deleted

Scenario: Frontend auto-refreshes before expiry
  Given a user is actively using the app
  When the access token is about to expire
  Then the frontend automatically calls POST /auth/refresh
  And the user's session continues uninterrupted
```
