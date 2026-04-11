# E8-US09: CSRF Protection Evaluation

**User Story**: As a security engineer, I want the application's CSRF protection posture to be evaluated and documented (and enhanced if necessary) so that state-changing requests cannot be forged by malicious third-party sites.

**Acceptance Criteria**:
- [ ] A documented assessment of current CSRF protection mechanisms (SameSite=strict cookies, CORS origin validation) and their sufficiency
- [ ] If SameSite=strict + CORS is deemed sufficient: an ADR is created documenting this decision with rationale
- [ ] If additional protection is needed: a CSRF token mechanism is implemented (e.g., double-submit cookie or synchronizer token pattern)
- [ ] Mobile API clients (Bearer token auth) are confirmed to be inherently CSRF-safe
- [ ] The assessment covers all state-changing endpoints (POST, PATCH, DELETE)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Security | Evaluate CSRF risk for web clients using SameSite=strict + CORS origin validation | — |
| Security | Evaluate CSRF risk for mobile clients using Bearer token authentication | — |
| Security | Document browser support matrix for SameSite=strict (all modern browsers support it) | — |
| ADR | Create ADR documenting CSRF protection decision | adr/ |
| API | (If needed) Implement CSRF token middleware with double-submit cookie pattern | packages/api/src/common/middleware/ |
| Frontend | (If needed) Include CSRF token in state-changing requests | packages/frontend/src/lib/api.ts |
| API | (If needed) Add CSRF validation tests | packages/api/src/ |

**Dependencies**: E2-US03 (CORS & Environment Hardening — relies on existing CORS configuration)

**Complexity**: S

**Status**: Pending

**Security Context**:
- **Severity**: Medium
- **Files**: `packages/api/src/controllers/auth.controller.ts` (Line 220-226), `packages/frontend/src/lib/api.ts`
- **Current protections**:
  1. **SameSite=strict cookies**: The auth cookie is set with `sameSite: 'strict'`, which prevents the browser from sending it on any cross-origin request (including top-level navigations). This is the strongest SameSite policy.
  2. **CORS origin validation**: The API validates the Origin header against a whitelist and rejects unknown origins.
  3. **credentials: 'include'**: The frontend explicitly includes credentials, which combined with CORS means only whitelisted origins can send authenticated requests.
- **Assessment factors**:
  - SameSite=strict is supported by all modern browsers (Chrome 51+, Firefox 60+, Safari 12+, Edge 16+)
  - Mobile clients use Bearer tokens (not cookies), so CSRF is not applicable
  - The combination of SameSite=strict + CORS origin validation is generally considered sufficient by OWASP for modern applications
  - However, some security auditors and compliance frameworks may require an explicit CSRF token regardless
- **Risk**: Without an explicit CSRF token, the application relies entirely on browser-enforced SameSite policy. If a browser bug or misconfiguration bypasses SameSite, there is no secondary defense.

**Test Scenarios**:
```gherkin
Scenario: Cross-origin POST request is rejected
  Given a request originates from an untrusted origin
  When it sends a POST to a state-changing endpoint with credentials
  Then the request should be rejected by CORS policy

Scenario: SameSite cookie is not sent on cross-origin requests
  Given the auth cookie has SameSite=strict
  When a third-party site triggers a form submission to the API
  Then the browser should not include the auth cookie

Scenario: Mobile Bearer token is not vulnerable to CSRF
  Given a mobile client authenticates via Bearer token in Authorization header
  When a third-party site attempts to forge a request
  Then the Bearer token is not automatically included (CSRF is not possible)
```
