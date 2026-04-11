# E8-US05: CORS & Proxy Trust Hardening

**User Story**: As a platform operator, I want CORS origin validation to be strict and rate limiting to use accurate client IPs so that security controls cannot be bypassed by missing headers or proxy misconfiguration.

**Acceptance Criteria**:
- [ ] CORS handler documents why requests without an `Origin` header are allowed (server-to-server, health checks) or restricts them to safe methods (GET, HEAD)
- [ ] NestJS `trust proxy` is configured for production deployments behind load balancers/reverse proxies
- [ ] Rate limiting extracts the correct client IP using `X-Forwarded-For` when behind a proxy
- [ ] CORS `maxAge` is reduced from 86400s (24h) to a more conservative value (e.g., 3600s)
- [ ] Configuration is documented for different deployment topologies (direct, single proxy, multiple proxies)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `app.set('trust proxy', ...)` with configurable depth via env var | packages/api/src/main.ts |
| API | Update CORS origin handler to restrict no-origin requests to safe HTTP methods | packages/api/src/main.ts |
| API | Reduce CORS `maxAge` from 86400 to 3600 | packages/api/src/main.ts |
| API | Update rate limit guard to extract IP from `X-Forwarded-For` when trusted | packages/api/src/common/guards/rate-limit.guard.ts |
| API | Add integration tests for proxy IP extraction | packages/api/src/common/guards/rate-limit.guard.test.ts |
| Docs | Document proxy trust configuration for production | docs/ |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Security Context**:
- **Severity**: Medium
- **Files**: `packages/api/src/main.ts` (Lines 29-41, 77), `packages/api/src/common/guards/rate-limit.guard.ts` (Line 48)
- **Issues**:
  1. **CORS no-origin bypass**: The CORS handler allows all requests without an `Origin` header (`if (!origin) callback(null, true)`). While this is necessary for non-browser clients (curl, health checks, server-to-server), it means CORS validation is entirely bypassed for any client that omits the header. State-changing requests (POST, PATCH, DELETE) should ideally require a valid origin.
  2. **IP extraction behind proxy**: `request.ip` returns the proxy's IP when the app is behind a load balancer without `trust proxy` configured. This means all users behind the same proxy share one rate-limit bucket, and rate limiting becomes ineffective.
  3. **CORS maxAge**: A 24-hour preflight cache (`maxAge: 86400`) means CORS policy changes take up to 24 hours to take effect in browsers.

**Test Scenarios**:
```gherkin
Scenario: Requests without Origin are restricted to safe methods
  Given a request without an Origin header
  When the request uses POST method
  Then the CORS handler should reject it (or document why it's allowed)

Scenario: Rate limiting uses forwarded IP behind proxy
  Given the app is configured with trust proxy enabled
  And a request arrives with X-Forwarded-For header "203.0.113.1"
  When the rate limit guard extracts the client IP
  Then it should use "203.0.113.1" (not the proxy IP)

Scenario: CORS preflight cache is reasonably short
  Given a browser sends a CORS preflight request
  When the server responds
  Then the Access-Control-Max-Age should be 3600 or less
```
