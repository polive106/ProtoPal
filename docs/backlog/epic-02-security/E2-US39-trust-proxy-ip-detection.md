# E2-US39: Trust Proxy and IP Detection Configuration

**User Story**: As a platform operator, I want the application to correctly identify client IP addresses behind reverse proxies so that IP-based rate limiting and audit logging reflect the true client rather than the proxy address.

**Acceptance Criteria**:
- [ ] Express `trust proxy` is configured via environment variable (default: `false` for development, configurable for production)
- [ ] When `TRUST_PROXY` is set (e.g., `1`, `loopback`, or a specific IP), `req.ip` returns the client IP from `X-Forwarded-For`
- [ ] When `TRUST_PROXY` is not set, `req.ip` returns the direct connection IP (safe default)
- [ ] Audit logs record the correct client IP when behind a proxy
- [ ] Rate limiting uses the correct client IP when behind a proxy
- [ ] Documentation in `.env.example` explains `TRUST_PROXY` configuration for common deployment scenarios (Nginx, AWS ALB, Cloudflare)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `app.set('trust proxy', process.env.TRUST_PROXY)` with safe default | packages/api/src/main.ts |
| API | Add `TRUST_PROXY` to environment variable validation | packages/api/src/main.ts |
| Config | Add `TRUST_PROXY` to `.env.example` with documentation | .env.example |
| API | Unit test verifying trust proxy is configured from env | packages/api/src/main.test.ts |
| E2E | Test that rate limiting respects X-Forwarded-For when trust proxy is enabled | e2e/tests/rate-limit.api.spec.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Default configuration does not trust proxy headers
  Given TRUST_PROXY is not set
  When a request arrives with X-Forwarded-For header
  Then req.ip returns the direct connection IP (ignoring the header)

Scenario: Proxy trust enabled with numeric value
  Given TRUST_PROXY is set to "1"
  When a request arrives through a proxy with X-Forwarded-For: 203.0.113.50
  Then req.ip returns 203.0.113.50

Scenario: Rate limiting uses correct IP behind proxy
  Given TRUST_PROXY is configured
  And a client at 203.0.113.50 sends requests through a proxy
  When the client exceeds the rate limit
  Then the rate limit applies to 203.0.113.50 (not the proxy IP)

Scenario: Audit logs record correct client IP
  Given TRUST_PROXY is configured
  When a user logs in through a proxy
  Then the audit log records the client's real IP from X-Forwarded-For
```
