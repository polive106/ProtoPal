# E8-US01: Reverse Proxy & IP Trust Configuration

**User Story**: As a platform operator, I want the application to correctly identify client IP addresses behind a reverse proxy so that rate limiting and audit logging work accurately in production.

**Acceptance Criteria**:
- [ ] Express `trust proxy` is configured via environment variable (e.g., `TRUST_PROXY=1`)
- [ ] `request.ip` returns the real client IP when behind a load balancer / reverse proxy
- [ ] Rate limiting keys use the correct client IP, not the proxy IP
- [ ] Audit log entries record the real client IP
- [ ] The `trust proxy` setting defaults to disabled (safe for direct exposure)
- [ ] Documentation updated with reverse proxy configuration guidance

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `TRUST_PROXY` env var and call `app.set('trust proxy', ...)` in bootstrap | packages/api/src/main.ts |
| API | Add `TRUST_PROXY` to `.env.example` with documentation comment | .env.example |
| API | Verify rate-limit guard uses correct IP after trust proxy change | packages/api/src/common/guards/rate-limit.guard.ts |
| API | Unit tests for IP extraction with and without proxy headers | packages/api/src/main.test.ts |
| E2E | Verify rate-limit headers reflect real IP | e2e/tests/rate-limit.api.spec.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Real client IP used for rate limiting behind proxy
  Given TRUST_PROXY is set to 1
  And the request includes X-Forwarded-For header with a client IP
  When the rate limit guard extracts the IP
  Then it should use the client IP from X-Forwarded-For, not the proxy IP

Scenario: Trust proxy disabled by default
  Given TRUST_PROXY is not set
  When a request arrives with X-Forwarded-For header
  Then request.ip should return the direct connection IP

Scenario: Audit log records real client IP
  Given TRUST_PROXY is configured
  When a user logs in through a reverse proxy
  Then the audit log entry should contain the real client IP
```
