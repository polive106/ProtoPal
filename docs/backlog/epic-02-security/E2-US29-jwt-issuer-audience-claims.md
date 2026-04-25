# E2-US29: JWT Issuer & Audience Claims

**User Story**: As a platform operator, I want JWTs to include and validate `iss` (issuer) and `aud` (audience) claims so that tokens cannot be accepted across services if the signing secret is shared or compromised in a multi-service deployment.

**Acceptance Criteria**:
- [ ] `JwtService.generateToken()` sets `iss` claim to a configurable issuer string (default: `protopal-api`)
- [ ] `JwtService.generateToken()` sets `aud` claim to a configurable audience string (default: `protopal-client`)
- [ ] `JwtService.verifyToken()` validates both `iss` and `aud` claims and rejects tokens with mismatched values
- [ ] Issuer and audience values are configurable via environment variables (`JWT_ISSUER`, `JWT_AUDIENCE`)
- [ ] Existing tokens without `iss`/`aud` claims are rejected (no backward compatibility — users re-login)
- [ ] Mobile and web tokens use the same issuer/audience (single API serves both)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `.setIssuer()` and `.setAudience()` to `generateToken()` | packages/api/src/services/JwtService.ts |
| API | Add `issuer` and `audience` options to `jwtVerify()` call | packages/api/src/services/JwtService.ts |
| API | Add `JWT_ISSUER` and `JWT_AUDIENCE` env var support with defaults | packages/api/src/services/JwtService.ts |
| API | Update unit tests for issuer/audience validation | packages/api/src/services/JwtService.test.ts |
| API | Update auth guard tests if needed | packages/api/src/common/guards/auth.guard.test.ts |

**Dependencies**: E2-US01

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Generated token includes iss and aud claims
  When a token is generated for a user
  Then the token payload should include iss: "protopal-api"
  And the token payload should include aud: "protopal-client"

Scenario: Token with wrong issuer is rejected
  Given a token signed with the correct secret but iss: "other-service"
  When the token is verified
  Then verification fails with 401 Unauthorized

Scenario: Token with wrong audience is rejected
  Given a token signed with the correct secret but aud: "other-client"
  When the token is verified
  Then verification fails with 401 Unauthorized

Scenario: Custom issuer/audience from environment
  Given JWT_ISSUER="my-api" and JWT_AUDIENCE="my-app"
  When a token is generated and verified
  Then both claims match the custom values
```
