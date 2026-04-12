# E8-US03: JWT Hardening — Issuer/Audience Claims & Role Re-validation

**User Story**: As a platform operator, I want JWT tokens to include and verify issuer/audience claims and for role changes to take effect promptly so that tokens cannot be misused across environments and privilege changes are enforced.

**Acceptance Criteria**:
- [ ] JWT tokens include `iss` (issuer) and `aud` (audience) claims
- [ ] Token verification rejects tokens with incorrect `iss` or `aud`
- [ ] Issuer and audience are configurable via environment variables with sensible defaults
- [ ] Roles are re-fetched from the database on each authenticated request (or access tokens are short-lived per E8-US02)
- [ ] If a user's roles are changed by an admin, the change takes effect within one access token lifetime
- [ ] Tokens from different environments (dev, staging, prod) are not interchangeable

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `JWT_ISSUER` and `JWT_AUDIENCE` env vars to `.env.example` | .env.example |
| API | Update JwtService to set `iss` and `aud` claims during signing | packages/api/src/services/JwtService.ts |
| API | Update JwtService to verify `iss` and `aud` during token verification | packages/api/src/services/JwtService.ts |
| API | Update AuthGuard to re-fetch user roles from DB on each request | packages/api/src/common/guards/auth.guard.ts |
| API | Update RolesGuard to use fresh DB roles instead of JWT-embedded roles | packages/api/src/common/guards/roles.guard.ts |
| API | Unit tests for iss/aud claim verification | packages/api/src/services/JwtService.test.ts |
| API | Integration test for role re-validation | packages/api/src/common/guards/auth.guard.test.ts |
| E2E | Token from wrong issuer rejected | e2e/tests/auth.api.spec.ts |

**Dependencies**: None (complements E8-US02 but can be done independently)

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Token with correct issuer and audience is accepted
  Given a token is signed with the correct issuer and audience
  When the token is verified
  Then verification should succeed

Scenario: Token with wrong issuer is rejected
  Given a token is signed with a different issuer
  When the token is presented to the API
  Then the request should be rejected with 401

Scenario: Token with wrong audience is rejected
  Given a token is signed with a different audience
  When the token is presented to the API
  Then the request should be rejected with 401

Scenario: Role change takes effect on next request
  Given a user has role "user" and a valid access token
  When an admin changes the user's role to "admin"
  And the user makes an authenticated request
  Then the user should have the updated "admin" role
```
