# E2-US46: Helmet Security Headers Completeness

**User Story**: As a platform operator, I want the application to serve a comprehensive set of security headers so that browser-side attack vectors (MIME sniffing, clickjacking, mixed content, feature abuse) are mitigated beyond the current minimal CSP configuration.

**Acceptance Criteria**:
- [ ] Helmet configuration explicitly sets `Permissions-Policy` to deny geolocation, microphone, camera, and payment
- [ ] CSP `style-src` directive is set to `'self'` (with nonce or hash if inline styles are needed)
- [ ] CSP `img-src` directive is set to `'self' data:` (allowing data URIs for inline images)
- [ ] CSP `connect-src` directive is set to `'self'` (restricting fetch/XHR targets)
- [ ] CSP `font-src` directive is set to `'self'` (plus Google Fonts domains if used)
- [ ] CSP `form-action` directive is set to `'self'` (preventing form submissions to external domains)
- [ ] CSP `base-uri` directive is set to `'self'` (preventing base tag injection)
- [ ] CSP `upgrade-insecure-requests` directive is included for production
- [ ] `X-Content-Type-Options: nosniff` is explicitly confirmed (Helmet default, but verify)
- [ ] All headers are verified via E2E test that inspects response headers

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `Permissions-Policy` header to Helmet config | packages/api/src/main.ts |
| API | Add `style-src`, `img-src`, `connect-src`, `font-src` to CSP directives | packages/api/src/main.ts |
| API | Add `form-action` and `base-uri` to CSP directives | packages/api/src/main.ts |
| API | Add `upgrade-insecure-requests` for production environment | packages/api/src/main.ts |
| API | Verify `X-Content-Type-Options: nosniff` is present in responses | packages/api/src/main.ts |
| API | Unit test verifying all expected headers are present | packages/api/src/main.test.ts |
| E2E | E2E test asserting security headers on API responses | e2e/tests/smoke.spec.ts |

**Dependencies**: E2-US07, E2-US19

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Permissions-Policy header restricts browser features
  When I make any request to the API
  Then the Permissions-Policy header should deny geolocation, microphone, camera, and payment

Scenario: CSP includes comprehensive directives
  When I make any request to the API
  Then the Content-Security-Policy header should include:
    | Directive    | Value            |
    | default-src  | 'self'           |
    | script-src   | 'self'           |
    | style-src    | 'self'           |
    | img-src      | 'self' data:     |
    | connect-src  | 'self'           |
    | font-src     | 'self'           |
    | object-src   | 'none'           |
    | form-action  | 'self'           |
    | base-uri     | 'self'           |
    | frame-ancestors | 'none'        |

Scenario: X-Content-Type-Options is set
  When I make any request to the API
  Then the X-Content-Type-Options header should be 'nosniff'

Scenario: Upgrade-insecure-requests is set in production
  Given NODE_ENV is 'production'
  When I make any request to the API
  Then the CSP should include the upgrade-insecure-requests directive
```
