# E8-US08: Session Management & Device Visibility

**User Story**: As a user, I want to see my active sessions and revoke sessions on other devices so that I can secure my account if a device is lost or compromised.

**Security Finding**: There is no way for users to:
- View active sessions (devices, locations, last activity)
- Revoke individual sessions
- Revoke all sessions except the current one ("sign out everywhere")
- Be notified of new logins from unknown devices

The only session revocation mechanism is the token version increment (which happens on password reset), which invalidates ALL tokens including the current session. There is no per-session tracking.

**Current State**:
- Token blacklist exists but only tracks revoked tokens, not active sessions
- `tokenVersion` in user table increments on password reset, invalidating all tokens
- No session table or device tracking

**Acceptance Criteria**:
- [ ] A `sessions` table tracks active sessions (id, user_id, device_info, ip_address, created_at, last_activity_at, revoked_at)
- [ ] Login creates a session record; session ID is embedded in the JWT payload
- [ ] A `GET /auth/sessions` endpoint returns the user's active sessions
- [ ] A `DELETE /auth/sessions/:id` endpoint revokes a specific session
- [ ] A `POST /auth/sessions/revoke-all` endpoint revokes all sessions except the current one
- [ ] Revoked sessions are rejected by the auth guard
- [ ] Frontend provides a "Active Sessions" page in profile/settings
- [ ] Device info (User-Agent) and IP are captured on login
- [ ] Session last activity is updated periodically
- [ ] Unit, integration, and E2E tests

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Add `Session` entity and `SessionRepository` port | packages/domain/src/entities/, packages/domain/src/ports/ |
| Database | Add `sessions` table to schema | packages/database/src/schema/ |
| Database | Implement `DrizzleSessionRepository` | packages/database/src/adapters/drizzle/ |
| Database | Implement `MongoSessionRepository` | packages/database/src/adapters/mongo/ |
| API | Add `GET /auth/sessions` endpoint | packages/api/src/controllers/auth.controller.ts |
| API | Add `DELETE /auth/sessions/:id` endpoint | packages/api/src/controllers/auth.controller.ts |
| API | Add `POST /auth/sessions/revoke-all` endpoint | packages/api/src/controllers/auth.controller.ts |
| API | Update login to create session record | packages/api/src/controllers/auth.controller.ts |
| API | Include session ID in JWT payload | packages/api/src/services/JwtService.ts |
| API | Update auth guard to check session status | packages/api/src/common/guards/auth.guard.ts |
| Frontend | Add "Active Sessions" UI in settings | packages/frontend/src/features/auth/ |
| Mobile | Add "Active Sessions" screen | packages/mobile/src/features/auth/ |
| Database | Update seed script | packages/database/src/seed.ts |
| E2E | Session management E2E tests | e2e/tests/ |

**Dependencies**: E8-US01 (recommended — refresh token rotation complements session management)

**Complexity**: L

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: User views active sessions
  Given I am logged in on two devices
  When I call GET /auth/sessions
  Then I see both sessions with device info and last activity

Scenario: User revokes a specific session
  Given I have two active sessions
  When I call DELETE /auth/sessions/:id for the other session
  Then the other session is revoked
  And my current session remains active

Scenario: User revokes all other sessions
  Given I have three active sessions
  When I call POST /auth/sessions/revoke-all
  Then only my current session remains active
  And the other two sessions are revoked
```
