# E2-US24: JWT Payload PII Minimization

**User Story**: As a security-conscious developer, I want the JWT access token payload to contain only the minimum claims needed for authorization so that personally identifiable information (PII) is not exposed if a token is intercepted, logged, or leaked.

**Acceptance Criteria**:
- [ ] JWT payload contains only: `sub` (user ID), `roles`, `tokenVersion`, and standard claims (`iat`, `exp`)
- [ ] PII fields (`email`, `firstName`, `lastName`, `status`) are removed from the JWT payload
- [ ] `GET /auth/me` remains the source of truth for user profile data (already works this way)
- [ ] Frontend `AuthProvider` fetches user details from `/auth/me` instead of extracting them from the token
- [ ] Mobile `AuthProvider` fetches user details from `/auth/me` instead of extracting them from the token/login response
- [ ] Login response body still includes user profile data (for immediate UI rendering before `/auth/me` is called)
- [ ] `AuthGuard` continues to work with the minimal payload (only needs `sub` and `tokenVersion`)
- [ ] `RolesGuard` continues to work with `roles` in the payload
- [ ] All existing tests are updated to reflect the smaller JWT payload

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Remove `email`, `firstName`, `lastName`, `status` from `JwtPayload` interface | packages/api/src/services/JwtService.ts |
| API | Update `generateToken()` call in login handler to pass minimal payload | packages/api/src/controllers/auth.controller.ts |
| API | Update `AuthGuard` to work with minimal payload (already does) | packages/api/src/common/guards/auth.guard.ts |
| API | Update `NotesController` if it references removed fields from `req.user` | packages/api/src/controllers/notes.controller.ts |
| Frontend | Ensure `AuthProvider` uses `/auth/me` for profile data, not token claims | packages/frontend/src/providers/AuthProvider.tsx |
| Mobile | Ensure `AuthProvider` uses `/auth/me` for profile data, not token claims | packages/mobile/src/providers/AuthProvider.tsx |
| API | Update JWT-related unit tests | packages/api/src/services/JwtService.test.ts |
| API | Update auth controller tests | packages/api/src/controllers/auth.controller.test.ts |
| E2E | Verify auth flow still works end-to-end | e2e/tests/auth.api.spec.ts |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: JWT payload does not contain PII
  Given I log in successfully
  When I decode the JWT access token
  Then it should contain "sub", "roles", "tokenVersion", "iat", "exp"
  And it should NOT contain "email", "firstName", "lastName", or "status"

Scenario: Login response still includes user profile
  Given valid user credentials
  When I log in
  Then the response body should include user profile data (id, email, firstName, lastName, roles)

Scenario: Frontend loads user data from /auth/me
  Given I am authenticated
  When the app initializes
  Then the user profile should be fetched from GET /auth/me
  And the header should display the correct user name

Scenario: Auth guard works with minimal JWT
  Given a JWT with only sub, roles, and tokenVersion
  When I access a protected endpoint
  Then the request should succeed
```
