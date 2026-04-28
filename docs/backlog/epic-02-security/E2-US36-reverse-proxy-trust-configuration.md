# E2-US36: Reverse Proxy Trust Configuration

**User Story**: As a platform operator, I want the application to correctly identify client IP addresses when running behind a reverse proxy so that rate limiting, account lockout, and audit logging use the real client IP instead of the proxy's IP.

**Acceptance Criteria**:
- [ ] `app.set('trust proxy', ...)` is configured based on a `TRUST_PROXY` environment variable
- [ ] When `TRUST_PROXY` is not set, the default is `false` (direct connections, no proxy trust)
- [ ] When `TRUST_PROXY` is set to a number (e.g., `1`), Express trusts that many proxy hops
- [ ] `req.ip` returns the correct client IP when behind a single reverse proxy (nginx, ALB, etc.)
- [ ] Rate limiting uses the real client IP, not the proxy IP
- [ ] Audit logs record the real client IP
- [ ] Startup log includes the trust proxy configuration for operator verification
- [ ] Documentation covers common deployment scenarios (direct, single proxy, multiple proxies)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `TRUST_PROXY` env var handling and `app.set('trust proxy', ...)` | packages/api/src/main.ts |
| API | Add `TRUST_PROXY` to `validateStartupEnv()` logging | packages/api/src/main.ts |
| API | Add `TRUST_PROXY` to `.env.example` with documentation comment | .env.example |
| API | Unit tests verifying proxy trust configuration | packages/api/src/main.test.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Default trust proxy is disabled
  Given TRUST_PROXY is not set
  When the application starts
  Then trust proxy should be set to false

Scenario: Trust proxy respects environment variable
  Given TRUST_PROXY is set to '1'
  When the application starts
  Then trust proxy should be set to 1
  And req.ip should use X-Forwarded-For (one hop)

Scenario: Rate limiting uses real client IP behind proxy
  Given TRUST_PROXY is set to '1'
  And a request arrives with X-Forwarded-For: 203.0.113.50
  When rate limiting evaluates the request
  Then the rate limit key should use 203.0.113.50 (not the proxy IP)

Scenario: Audit log records real client IP
  Given TRUST_PROXY is set to '1'
  And a request arrives with X-Forwarded-For: 203.0.113.50
  When a login attempt is audited
  Then the audit log IP should be 203.0.113.50
```
