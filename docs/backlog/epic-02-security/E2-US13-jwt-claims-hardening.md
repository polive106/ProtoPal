# E2-US13: JWT Claims Hardening (Issuer, Audience & Algorithm Pinning)

**User Story**: As a platform operator, I want JWT tokens to include `issuer` and `audience` claims and to pin the signing algorithm so that tokens cannot be reused across services and algorithm-confusion attacks are mitigated.

**Acceptance Criteria**:
- [ ] `JwtService.generateToken()` sets `iss` (issuer) claim to a configurable value (e.g. `protopal-api`)
- [ ] `JwtService.generateToken()` sets `aud` (audience) claim to a configurable value (e.g. `protopal-client`)
- [ ] `JwtService.verifyToken()` validates `iss` and `aud` claims and rejects tokens that don't match
- [ ] Algorithm is pinned to `HS256` during verification (not just signing)
- [ ] `JWT_ISSUER` and `JWT_AUDIENCE` environment variables are supported with sensible defaults
- [ ] Existing tokens without `iss`/`aud` are rejected (no backwards compatibility — force re-login)
- [ ] A `jti` (JWT ID) claim is included for future per-token revocation without hashing
- [ ] Unit tests verify that tokens with wrong issuer/audience/algorithm are rejected
- [ ] E2E login flow still works end-to-end after changes

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `iss`, `aud`, and `jti` claims to `generateToken()` | packages/api/src/services/JwtService.ts |
| API | Validate `iss` and `aud` in `verifyToken()` using jose options | packages/api/src/services/JwtService.ts |
| API | Pin algorithm to `HS256` in `jwtVerify` options | packages/api/src/services/JwtService.ts |
| API | Accept `JWT_ISSUER` and `JWT_AUDIENCE` from env with defaults | packages/api/src/services/JwtService.ts |
| API | Pass issuer/audience config through DI module | packages/api/src/modules/services.module.ts |
| API | Update startup validation to log configured issuer/audience | packages/api/src/main.ts |
| API | Unit tests for claim validation and algorithm pinning | packages/api/src/services/JwtService.test.ts |
| E2E | Verify login still works after claim changes | e2e/tests/auth/login.spec.ts |

**Dependencies**: E2-US01

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Token with correct issuer and audience is accepted
  Given a user logs in and receives a JWT
  When the token is verified
  Then verification succeeds and the payload contains iss and aud claims

Scenario: Token with wrong issuer is rejected
  Given a JWT signed with issuer "other-service"
  When it is sent to a protected endpoint
  Then the response should be 401 Unauthorized

Scenario: Token with wrong audience is rejected
  Given a JWT signed with audience "other-client"
  When it is sent to a protected endpoint
  Then the response should be 401 Unauthorized

Scenario: Token signed with different algorithm is rejected
  Given a JWT signed with RS256 instead of HS256
  When it is sent to a protected endpoint
  Then the response should be 401 Unauthorized

Scenario: Token includes a unique jti claim
  Given a user logs in twice
  When both tokens are inspected
  Then each token has a different jti value
```
