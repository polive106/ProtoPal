# E8-US07: Security Headers & CSP Hardening

**User Story**: As a platform operator, I want comprehensive security headers configured so that the application is protected against clickjacking, MIME-type sniffing, protocol downgrade attacks, and information leakage via referrer headers.

**Acceptance Criteria**:
- [ ] Helmet configured with explicit HSTS header (max-age 1 year, includeSubDomains, preload) in production
- [ ] `Permissions-Policy` header restricts unnecessary browser features (camera, microphone, geolocation, etc.)
- [ ] `Referrer-Policy` explicitly set to `strict-origin-when-cross-origin`
- [ ] CSP directives expanded with explicit `style-src`, `img-src`, `connect-src`, and `font-src`
- [ ] `X-Content-Type-Options: nosniff` explicitly confirmed (Helmet default)
- [ ] Security headers verified in E2E tests
- [ ] Headers are environment-aware (HSTS only in production, CSP adjustable for dev)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Expand Helmet configuration with HSTS, Permissions-Policy, Referrer-Policy | packages/api/src/main.ts |
| API | Add complete CSP directives (style-src, img-src, connect-src, font-src) | packages/api/src/main.ts |
| API | Make HSTS conditional on `NODE_ENV === 'production'` | packages/api/src/main.ts |
| API | Unit tests verifying header presence in responses | packages/api/src/main.test.ts |
| E2E | Assert security headers present on API responses | e2e/tests/smoke.spec.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: HSTS header present in production
  Given NODE_ENV is "production"
  When a request is made to any endpoint
  Then the Strict-Transport-Security header should be present
  And max-age should be at least 31536000

Scenario: Permissions-Policy restricts browser features
  When a request is made to any endpoint
  Then the Permissions-Policy header should restrict camera, microphone, and geolocation

Scenario: Referrer-Policy set correctly
  When a request is made to any endpoint
  Then the Referrer-Policy header should be "strict-origin-when-cross-origin"

Scenario: CSP includes all required directives
  When a request is made to any endpoint
  Then the Content-Security-Policy header should include default-src, script-src, style-src, img-src, connect-src, object-src, and frame-ancestors directives
```
