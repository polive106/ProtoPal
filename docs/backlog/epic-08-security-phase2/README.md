# Epic 08: Security Hardening Phase 2

## Overview

A second round of security hardening addressing gaps found during a comprehensive security review. Epic 02 covered foundational security (JWT management, rate limiting, CORS, headers, input validation, enumeration prevention). This epic addresses remaining production-readiness concerns: token lifecycle, email delivery, session management, proxy configuration, and defense-in-depth hardening.

## Stories

| ID | Title | Complexity | Status | Priority |
|----|-------|-----------|--------|----------|
| E8-US01 | Refresh Token Rotation | M | Pending | High |
| E8-US02 | Production Email Service Integration | M | Pending | High |
| E8-US03 | Express Trust Proxy & IP Forwarding | S | Pending | High |
| E8-US04 | Authenticated Password Change | S | Pending | Medium |
| E8-US05 | Rate Limit Verify & Reset Endpoints | XS | Pending | Medium |
| E8-US06 | Admin Endpoint Input Validation | XS | Pending | Medium |
| E8-US07 | MongoDB Query Sanitization | S | Pending | Medium |
| E8-US08 | Session Management & Device Visibility | L | Pending | Medium |
| E8-US09 | Mobile Web Token Storage Hardening | S | Pending | High |
| E8-US10 | Audit Log & Token Exposure Hardening | XS | Pending | Medium |
| E8-US11 | Route Parameter Validation | S | Pending | Low |
| E8-US12 | Mobile Certificate Pinning | M | Pending | Low |

## Implementation Order

Stories are ordered by priority and dependency:

1. **E8-US01** (Refresh Token Rotation) — foundational change that affects auth flow
2. **E8-US02** (Production Email Service) — required before any production deployment
3. **E8-US03** (Trust Proxy) — affects rate limiting accuracy for all endpoints
4. **E8-US09** (Mobile Web Token Storage) — fixes XSS-accessible token storage
5. **E8-US04** (Password Change) — depends on auth flow being stable
6. **E8-US05** (Rate Limit Verify/Reset) — quick hardening win
7. **E8-US06** (Admin Input Validation) — quick hardening win
8. **E8-US10** (Audit Log Hardening) — quick hardening win
9. **E8-US07** (MongoDB Sanitization) — defense-in-depth for MongoDB adapter
10. **E8-US08** (Session Management) — larger feature, depends on E8-US01
11. **E8-US11** (Route Parameter Validation) — defense-in-depth
12. **E8-US12** (Certificate Pinning) — mobile hardening
