# E2-US24: Frontend CSP & Source Map Hardening

**User Story**: As a platform operator, I want the frontend SPA to include Content Security Policy meta tags and exclude source maps from production builds so that XSS attack surface is minimized and application internals are not exposed to attackers.

**Acceptance Criteria**:
- [ ] `index.html` includes a `<meta http-equiv="Content-Security-Policy">` tag with restrictive directives
- [ ] CSP directives match or complement the backend Helmet CSP configuration
- [ ] CSP allows only `'self'` for scripts, styles, and connections
- [ ] CSP allows Google Fonts domains (`fonts.googleapis.com`, `fonts.gstatic.com`) for font loading
- [ ] CSP blocks `unsafe-inline` and `unsafe-eval` for scripts
- [ ] Vite production build explicitly disables source maps (`build.sourcemap: false`)
- [ ] Development builds retain source maps for debugging
- [ ] CSP violation reporting is configured via `report-uri` or `report-to` directive (optional, for monitoring)
- [ ] No CSP violations on the golden path (login, dashboard, notes CRUD)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Frontend | Add CSP meta tag to index.html | packages/frontend/index.html |
| Frontend | Configure Vite to disable source maps in production | packages/frontend/vite.config.ts |
| Frontend | Verify no inline scripts or styles that would violate CSP | packages/frontend/index.html |
| Frontend | Test all pages for CSP violations in browser console | Manual testing |
| E2E | Verify no CSP violations during E2E test runs | e2e/tests/ |

**Dependencies**: E2-US07

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: CSP meta tag is present in production build
  Given the frontend is built for production
  When I inspect the HTML source of the application
  Then a Content-Security-Policy meta tag is present with restrictive directives

Scenario: Source maps are not included in production build
  Given the frontend is built for production
  When I inspect the output bundle
  Then no .map files are generated
  And no sourceMappingURL comments are present in JavaScript files

Scenario: Application functions without CSP violations
  Given the CSP is active
  When I navigate through login, dashboard, and notes features
  Then no CSP violation errors appear in the browser console

Scenario: Google Fonts load successfully under CSP
  Given the CSP allows fonts.googleapis.com and fonts.gstatic.com
  When the application loads
  Then fonts are rendered correctly without CSP blocking
```
