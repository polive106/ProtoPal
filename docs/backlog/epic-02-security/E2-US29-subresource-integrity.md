# E2-US29: Subresource Integrity for External Resources

**User Story**: As a security-conscious operator, I want all externally-loaded resources to include Subresource Integrity (SRI) hashes so that CDN compromises cannot inject malicious content into the application.

**Acceptance Criteria**:
- [ ] Google Fonts stylesheet `<link>` tag includes `integrity` and `crossorigin` attributes
- [ ] SRI hashes are generated using SHA-384 or SHA-512 algorithms
- [ ] Any future external resources added to `index.html` must include SRI (documented in AGENTS.md or contributing guide)
- [ ] Build process validates that all external `<link>` and `<script>` tags have `integrity` attributes (lint rule or build check)
- [ ] If SRI validation fails at runtime (CDN compromise), the resource is blocked and the app renders gracefully without it

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Frontend | Generate SRI hashes for Google Fonts CSS and add `integrity` attribute | `packages/frontend/index.html` |
| Frontend | Add `crossorigin="anonymous"` to font stylesheet link (required for SRI) | `packages/frontend/index.html` |
| CI | Add CI check that validates all external resources have SRI attributes | `.github/workflows/test.yml` |
| Docs | Document SRI requirement for external resources | `AGENTS.md` |
| Test | E2E test verifying fonts load with SRI attributes | `e2e/tests/security-headers.test.ts` |

**Dependencies**: None

**Complexity**: XS

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: External resources include SRI hashes
  Given the frontend application is loaded
  When I inspect the HTML source
  Then all external link tags include an integrity attribute
  And all external link tags include crossorigin attribute

Scenario: Application renders gracefully without fonts
  Given the Google Fonts CDN is unreachable
  When I load the frontend application
  Then the app renders using system fallback fonts
  And no JavaScript errors are thrown
```
