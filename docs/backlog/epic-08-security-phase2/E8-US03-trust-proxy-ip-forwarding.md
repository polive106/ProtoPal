# E8-US03: Express Trust Proxy & IP Forwarding

**User Story**: As a platform operator, I want the API server to correctly resolve client IP addresses behind a reverse proxy so that rate limiting, account lockout, and audit logging operate on real client IPs.

**Security Finding**: The application uses `req.ip` for rate limiting (`packages/api/src/common/guards/rate-limit.guard.ts` line 48) and audit logging (`packages/api/src/services/AuditLogService.ts`), but there is no `app.set('trust proxy', ...)` configuration (`packages/api/src/main.ts`). Behind a load balancer, CDN, or reverse proxy (Nginx, AWS ALB, Cloudflare), `req.ip` returns the proxy IP, not the client IP. This means:
- All users appear to share the same IP for rate limiting, causing legitimate users to be rate-limited together
- Audit logs record the proxy IP, making them useless for incident response
- Account lockout is either too aggressive (locks out all users) or ineffective

**Current State**:
- `packages/api/src/main.ts` — no `trust proxy` configuration
- Rate limit guard uses `request.ip || 'unknown'` (line 48)
- Audit log uses `req.ip` for all security events

**Acceptance Criteria**:
- [ ] Express `trust proxy` is configurable via `TRUST_PROXY` env var (e.g., `1`, `loopback`, `uniquelocal`, or specific CIDR)
- [ ] Default is `false` (safe default for direct connections)
- [ ] When configured, `req.ip` correctly resolves to the `X-Forwarded-For` client IP
- [ ] Rate limiting uses the resolved client IP
- [ ] Audit logs include the resolved client IP
- [ ] Documentation in `.env.example` explains the configuration
- [ ] Unit tests verify IP resolution with and without trust proxy

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `app.set('trust proxy', ...)` based on `TRUST_PROXY` env var | packages/api/src/main.ts |
| API | Document `TRUST_PROXY` in env example | .env.example |
| API | Unit tests for proxy configuration | packages/api/src/main.test.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Client IP is resolved from X-Forwarded-For when trust proxy is set
  Given TRUST_PROXY is set to '1'
  When a request arrives with X-Forwarded-For: '203.0.113.50'
  Then req.ip should be '203.0.113.50'
  And the audit log should record '203.0.113.50'

Scenario: X-Forwarded-For is ignored when trust proxy is disabled
  Given TRUST_PROXY is not set
  When a request arrives with X-Forwarded-For: '203.0.113.50'
  Then req.ip should be the direct connection IP
```
