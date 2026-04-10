# E7-US09: Mobile Refresh Token Strategy

**User Story**: As a mobile user, I want my session to persist securely beyond the initial token lifetime so that I do not have to re-login every 24 hours while my tokens are automatically rotated for security.

**Acceptance Criteria**:
- [ ] A refresh token mechanism exists alongside the existing JWT access token
- [ ] Access tokens are short-lived (15 minutes) and refresh tokens are long-lived (30 days)
- [ ] Refresh tokens are stored as hashed values in the database
- [ ] `POST /auth/refresh` endpoint issues a new access token and rotates the refresh token
- [ ] Used refresh tokens are invalidated (rotation prevents replay attacks)
- [ ] Mobile client automatically refreshes tokens before expiration
- [ ] Web client continues to use httpOnly cookie flow (no breaking change)
- [ ] Unit tests cover token refresh, rotation, and replay detection
- [ ] E2E tests confirm mobile token refresh flow

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Add `RefreshToken` entity and `RefreshTokenRepository` port | packages/domain/src/entities/RefreshToken.ts, packages/domain/src/ports/RefreshTokenRepository.ts |
| Domain | Add `RefreshSession` use-case with rotation and replay detection | packages/domain/src/use-cases/RefreshSession.ts |
| Database | Add `refresh_tokens` table (token_hash, user_id, family_id, expires_at, revoked_at) | packages/database/src/schema.sqlite.ts, packages/database/src/schema.postgres.ts |
| Database | Implement `DrizzleRefreshTokenRepository` adapter | packages/database/src/adapters/DrizzleRefreshTokenRepository.ts |
| API | Add `POST /auth/refresh` endpoint | packages/api/src/controllers/auth.controller.ts |
| API | Update login to issue refresh token for mobile clients | packages/api/src/controllers/auth.controller.ts |
| API | Reduce access token expiry to 15 minutes | packages/api/src/services/JwtService.ts |
| API | Add refresh token cleanup to TokenCleanupService | packages/api/src/services/TokenCleanupService.ts |
| Mobile | Add automatic token refresh logic in API client | packages/mobile/src/lib/api.ts |
| Mobile | Store refresh token in expo-secure-store | packages/mobile/src/providers/AuthProvider.tsx |
| API | Unit tests for refresh, rotation, and replay detection | packages/api/src/controllers/auth.controller.test.ts, packages/domain/src/use-cases/RefreshSession.test.ts |
| E2E | Mobile token refresh E2E test | e2e/tests/auth/ |

**Dependencies**: None

**Complexity**: L

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Refresh token issues new access token
  Given I have a valid refresh token
  When I call POST /auth/refresh with the refresh token
  Then I should receive a new access token and a new refresh token
  And the old refresh token should be invalidated

Scenario: Replayed refresh token revokes entire family
  Given I have used a refresh token to get a new one
  When an attacker replays the old refresh token
  Then all tokens in the same family should be revoked
  And the attacker should receive a 401 Unauthorized

Scenario: Expired refresh token is rejected
  Given I have a refresh token that expired
  When I call POST /auth/refresh
  Then I should receive a 401 Unauthorized

Scenario: Mobile client auto-refreshes before expiry
  Given I am logged in on mobile with a 15-minute access token
  When the token is about to expire
  Then the mobile client should automatically refresh it without user intervention
```
