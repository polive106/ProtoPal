# E2-US26: JWT Secret Rotation

**User Story**: As a platform operator, I want to be able to rotate the JWT signing secret without immediately invalidating all active user sessions so that routine secret rotation and incident response do not require every user to re-authenticate simultaneously.

**Acceptance Criteria**:
- [ ] Application supports multiple JWT secrets: a primary (signing) key and one or more verification-only (old) keys
- [ ] New tokens are always signed with the primary secret
- [ ] Token verification tries the primary secret first, then falls back to old secrets
- [ ] Old secrets can be removed after their tokens' maximum lifetime has elapsed (e.g., after 24h or 15m depending on token expiry)
- [ ] Secrets are configured via environment variables (e.g., `JWT_SECRET` for primary, `JWT_SECRET_PREVIOUS` for the old key)
- [ ] Startup validation ensures at least the primary secret meets minimum length requirements
- [ ] Secret rotation is documented: step-by-step runbook for operators
- [ ] Audit log records when a token is verified using a non-primary (old) secret

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Update `JwtService` to accept an array of secrets (primary + previous) | packages/api/src/services/JwtService.ts |
| API | Update `sign()` to always use the primary secret | packages/api/src/services/JwtService.ts |
| API | Update `verify()` to try primary first, then fall back to previous secrets | packages/api/src/services/JwtService.ts |
| API | Update startup validation to parse `JWT_SECRET_PREVIOUS` env var | packages/api/src/main.ts |
| API | Add audit log entry when old secret is used for verification | packages/api/src/services/JwtService.ts |
| API | Unit tests for multi-secret signing and verification | packages/api/src/services/JwtService.test.ts |
| Docs | Create secret rotation runbook | docs/runbooks/jwt-secret-rotation.md |

**Dependencies**: E2-US01

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: New tokens are signed with the primary secret
  Given a primary secret "new-secret" and a previous secret "old-secret"
  When a new token is generated
  Then the token is signed with "new-secret"
  And the token can be verified with "new-secret"

Scenario: Tokens signed with old secret are still valid
  Given a primary secret "new-secret" and a previous secret "old-secret"
  And a token was signed with "old-secret" before rotation
  When the token is verified
  Then verification succeeds (fallback to old secret)
  And an audit log entry records the fallback

Scenario: Tokens signed with removed secret are rejected
  Given only a primary secret "new-secret" is configured (no previous)
  And a token was signed with "removed-secret"
  When the token is verified
  Then verification fails with 401 Unauthorized

Scenario: Startup validates primary secret length
  Given JWT_SECRET is set to a 10-character string
  When the application starts
  Then startup fails with a fatal error about minimum secret length
```
