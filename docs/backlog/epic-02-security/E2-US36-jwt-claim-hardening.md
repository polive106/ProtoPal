# E2-US36: JWT Claim Hardening

**User Story**: As a platform operator, I want JWT tokens to include issuer and audience claims and have these validated on every request so that tokens cannot be reused across different services or environments.

**Acceptance Criteria**:
- [ ] JWT tokens include an `iss` (issuer) claim set to a configurable value (e.g., `PROTOPAL_JWT_ISSUER` env var, default `protopal-api`)
- [ ] JWT tokens include an `aud` (audience) claim set to a configurable value (e.g., `PROTOPAL_JWT_AUDIENCE` env var, default `protopal-client`)
- [ ] Token verification rejects tokens with mismatched `iss` or `aud` claims
- [ ] JWT secret validation enforces minimum entropy (reject simple dictionary words or repeated characters, not just length)
- [ ] Existing tokens without `iss`/`aud` are rejected after deployment (breaking change — coordinate with E2-US13 refresh token rollout)
- [ ] All auth-related E2E tests pass with the new claims

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `iss` and `aud` claims to JWT sign payload | packages/api/src/services/JwtService.ts |
| API | Validate `iss` and `aud` on JWT verify | packages/api/src/services/JwtService.ts |
| API | Add `PROTOPAL_JWT_ISSUER` and `PROTOPAL_JWT_AUDIENCE` env vars | .env.example |
| API | Strengthen JWT secret validation (entropy check beyond length) | packages/api/src/services/JwtService.ts |
| API | Unit tests for claim generation and validation | packages/api/src/services/JwtService.test.ts |
| E2E | Update E2E JWT secret config if needed | playwright.config.ts |

**Dependencies**: E2-US01

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: JWT includes issuer and audience claims
  Given I log in successfully
  When I decode the JWT token
  Then it contains an iss claim matching the configured issuer
  And it contains an aud claim matching the configured audience

Scenario: Token with wrong issuer is rejected
  Given I have a valid JWT signed with the correct secret
  But the iss claim does not match the configured issuer
  When I call GET /auth/me with this token
  Then the response should be 401 Unauthorized

Scenario: Token with wrong audience is rejected
  Given I have a valid JWT signed with the correct secret
  But the aud claim does not match the configured audience
  When I call GET /auth/me with this token
  Then the response should be 401 Unauthorized

Scenario: Weak JWT secret is rejected at startup
  Given JWT_SECRET is set to "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" (low entropy)
  When the API starts
  Then it should fail with a validation error about secret strength
```
