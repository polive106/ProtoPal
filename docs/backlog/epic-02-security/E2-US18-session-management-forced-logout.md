# E2-US18: Session Management & Forced Logout

**User Story**: As a user, I want to view my active sessions and terminate all sessions at once so that I can recover from a suspected account compromise without having to change my password.

**Acceptance Criteria**:
- [ ] `POST /auth/logout-all` terminates all active sessions for the current user by incrementing their `tokenVersion`
- [ ] After calling logout-all, all previously issued access tokens are rejected by `AuthGuard`
- [ ] After calling logout-all, all refresh tokens for the user are revoked (if E2-US13 is implemented)
- [ ] The current session's cookie is also cleared in the logout-all response
- [ ] The action is recorded in the audit log with `AuditAction.LOGOUT_ALL`
- [ ] Rate limiting is applied to the logout-all endpoint (5 per hour)
- [ ] Frontend provides a "Sign out everywhere" button in the user's account/security settings

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Add `InvalidateAllSessions` use case that increments tokenVersion | packages/domain/src/use-cases/InvalidateAllSessions.ts |
| API | Add `POST /auth/logout-all` endpoint | packages/api/src/controllers/auth.controller.ts |
| API | Add `LOGOUT_ALL` to `AuditAction` enum | packages/api/src/services/AuditLogService.ts |
| API | Apply rate limiting to the new endpoint | packages/api/src/controllers/auth.controller.ts |
| Frontend | Add "Sign out everywhere" button in account settings or header menu | packages/frontend/src/features/auth/ |
| Mobile | Add "Sign out everywhere" option in mobile account screen | packages/mobile/src/features/auth/ |
| API | Unit + integration tests for logout-all | packages/api/src/controllers/auth.controller.integration.test.ts |
| E2E | Test that all sessions are invalidated after logout-all | e2e/tests/auth.api.spec.ts |

**Dependencies**: E2-US01

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Logout-all invalidates all sessions
  Given I am logged in on two separate sessions (token A and token B)
  When I call POST /auth/logout-all using token A
  Then token A should no longer be valid
  And token B should no longer be valid
  And the auth_token cookie should be cleared

Scenario: Logout-all increments token version
  Given my tokenVersion is 3
  When I call POST /auth/logout-all
  Then my tokenVersion should be 4
  And tokens issued with tokenVersion 3 are rejected

Scenario: Logout-all is rate limited
  Given I am authenticated
  When I call POST /auth/logout-all 6 times in 1 hour
  Then the 6th request should return 429 Too Many Requests

Scenario: Logout-all is audited
  Given I am authenticated
  When I call POST /auth/logout-all
  Then an audit log entry with action LOGOUT_ALL should exist
  And it should include my user ID
```
