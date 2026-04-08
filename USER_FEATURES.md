# Feature Tracking by User Type

## Platform Operator

| Feature | Status | Story |
|---------|--------|-------|
| CORS whitelist enforced in all environments | Done | E2-US03 |
| Startup env validation (fail-fast on missing JWT_SECRET) | Done | E2-US03 |
| NODE_ENV warning on startup | Done | E2-US03 |
| Rate limiting cannot be disabled in production | Done | E2-US03 |
| Account lockout after 5 failed login attempts (exponential backoff) | Done | E2-US04 |
| JWT token not exposed in web login response body (cookie-only) | Done | E2-US10 |
| Cookie SameSite upgraded to strict | Done | E2-US10 |
| Email verification via POST (no query param token exposure) | Done | E2-US10 |
| Verification tokens removed from API response bodies | Done | E2-US10 |

## Admin

| Feature | Status | Story |
|---------|--------|-------|
| Login | Done | E1-US02 |
| View dashboard | Done | E1-US02 |
| Manage notes | Done | E1-US03 |
| Unlock locked accounts | Done | E2-US04 |
| View audit logs | Pending | E2-US07 |

## User

| Feature | Status | Story |
|---------|--------|-------|
| Register | Done | E1-US02 |
| Login | Done | E1-US02 |
| View dashboard | Done | E1-US02 |
| Create notes | Done | E1-US03 |
| Edit notes | Done | E1-US03 |
| Delete notes | Done | E1-US03 |
| View notes | Done | E1-US03 |
| Email verification | Done | E2-US02 |
| Password reset | Done | E2-US06 |
| Mobile: Login (token in body via X-Client-Type header) | Done | E2-US10 / E3-US02 |
| Mobile: Register | Done | E3-US02 |
| Mobile: View notes | Done | E3-US03 |
| Mobile: Create notes | Done | E3-US03 |
| Mobile: Edit notes | Done | E3-US03 |
| Mobile: Delete notes | Done | E3-US03 |
