# E8-US06: CSP & Security Headers Enhancement

**User Story**: As a security engineer, I want the Content Security Policy to be comprehensive so that the attack surface for XSS, clickjacking, and data exfiltration is minimized.

**Acceptance Criteria**:
- [ ] CSP includes `style-src` directive restricting stylesheet sources (allowing Google Fonts)
- [ ] CSP includes `img-src` directive restricting image sources
- [ ] CSP includes `connect-src` directive restricting API/WebSocket connections to known origins
- [ ] CSP includes `font-src` directive restricting font sources (allowing Google Fonts)
- [ ] CSP includes `base-uri` restricting base element targets to `'self'`
- [ ] CSP includes `form-action` restricting form submission targets to `'self'`
- [ ] `upgrade-insecure-requests` is enabled in production
- [ ] `Strict-Transport-Security` (HSTS) header is set in production with appropriate max-age
- [ ] Frontend `vite.config.ts` explicitly disables source maps for production builds
- [ ] Existing functionality (Google Fonts loading, API calls) is not broken by new CSP directives

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Expand Helmet CSP directives to include style-src, img-src, connect-src, font-src, base-uri, form-action | packages/api/src/main.ts |
| API | Add upgrade-insecure-requests directive (production only) | packages/api/src/main.ts |
| API | Configure HSTS via Helmet with appropriate max-age (e.g., 1 year) | packages/api/src/main.ts |
| Frontend | Explicitly set `build.sourcemap: false` in Vite config | packages/frontend/vite.config.ts |
| E2E | Verify CSP headers in API response tests | e2e/tests/ |

**Dependencies**: E2-US07 (Security Headers & Audit Logging — extends existing Helmet config)

**Complexity**: S

**Status**: Pending

**Security Context**:
- **Severity**: Medium
- **File**: `packages/api/src/main.ts` (Lines 60-70)
- **Issue**: The current CSP configuration only sets `defaultSrc`, `scriptSrc`, `objectSrc`, and `frameAncestors`. Several important directives are missing:
  - Without `style-src`: Browsers fall back to `defaultSrc` which is `'self'`, but the frontend loads Google Fonts stylesheets from `fonts.googleapis.com` — this may be silently blocked or require `'unsafe-inline'` if inline styles are used.
  - Without `connect-src`: No restriction on where `fetch`/`XMLHttpRequest` can connect, allowing potential data exfiltration.
  - Without `base-uri`: An attacker who injects a `<base>` tag could redirect all relative URLs.
  - Without `upgrade-insecure-requests`: Mixed content may load over HTTP in production.
  - Without `HSTS`: Browsers won't enforce HTTPS on subsequent visits.
  - Source maps in production can expose source code to attackers.

**Test Scenarios**:
```gherkin
Scenario: CSP headers include all required directives
  Given the API server is running
  When I make a request to any endpoint
  Then the Content-Security-Policy header should include style-src, img-src, connect-src, font-src, base-uri, and form-action directives

Scenario: HSTS header is present in production
  Given the API server is running in production mode
  When I make a request
  Then the Strict-Transport-Security header should be present with max-age >= 31536000

Scenario: Google Fonts continue to load
  Given the CSP allows fonts.googleapis.com in style-src and fonts.gstatic.com in font-src
  When the frontend loads
  Then Google Fonts should render correctly without CSP violations

Scenario: Production builds exclude source maps
  Given the frontend is built for production
  When I inspect the dist/ output
  Then no .map files should be present
```
