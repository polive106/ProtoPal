# E7-US07: Proxy Trust & Rate Limit IP Validation

**User Story**: As a platform operator, I want the application to correctly identify client IPs behind reverse proxies so that rate limiting cannot be bypassed by spoofing IP headers.

**Acceptance Criteria**:
- [ ] Express `trust proxy` is configured appropriately for production deployments (e.g., `app.set('trust proxy', 1)`)
- [ ] Trust proxy setting is environment-configurable (off in dev, configurable in prod)
- [ ] Rate limit guard uses the trusted `request.ip` after proxy configuration
- [ ] A startup warning is logged when `DISABLE_RATE_LIMIT=true` in non-production
- [ ] Documentation updated with proxy trust configuration guidance
- [ ] Unit tests verify correct IP extraction behind proxy

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Configure `app.set('trust proxy')` based on `TRUST_PROXY` env var | packages/api/src/main.ts |
| API | Add startup warning when rate limiting is disabled | packages/api/src/common/guards/rate-limit.guard.ts |
| API | Unit test for IP extraction with and without proxy | packages/api/src/common/guards/rate-limit.guard.test.ts |
| Config | Add `TRUST_PROXY` to `.env.example` with documentation | .env.example |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Rate limit uses real client IP behind proxy
  Given the app is configured with TRUST_PROXY=1
  And a request arrives with X-Forwarded-For: 1.2.3.4
  When the rate limit guard extracts the IP
  Then it should use 1.2.3.4 (not the proxy IP)

Scenario: Startup warns when rate limiting is disabled
  Given DISABLE_RATE_LIMIT=true and NODE_ENV=development
  When the application starts
  Then a warning should be logged to console

Scenario: Trust proxy is off by default in development
  Given TRUST_PROXY is not set
  When the app starts in development mode
  Then trust proxy should be disabled
```
