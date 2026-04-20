# E2-US29: Security Event Monitoring & Alerting

**User Story**: As a platform operator, I want the application to emit structured security events and support configurable alerting thresholds so that I am notified when suspicious activity patterns indicate an ongoing attack or compromised account.

**Acceptance Criteria**:
- [ ] A `SecurityEventService` emits structured events for: `AUTH_FAILURE_SPIKE`, `RATE_LIMIT_BREACH`, `ACCOUNT_LOCKED`, `TOKEN_REVOKED`, `ADMIN_ACTION`, `SUSPICIOUS_ORIGIN`
- [ ] Events include: `type`, `severity` (info/warning/critical), `timestamp`, `sourceIp`, `userId` (if known), `metadata`
- [ ] Configurable thresholds via environment variables (e.g., `SECURITY_AUTH_FAILURE_THRESHOLD=20` failures per 15 minutes triggers `AUTH_FAILURE_SPIKE`)
- [ ] When a threshold is breached, the service invokes a configurable webhook URL (`SECURITY_WEBHOOK_URL`) with the event payload
- [ ] All security events are written to structured JSON logs (separate from application logs) for log aggregator consumption
- [ ] Rate limit guard emits `RATE_LIMIT_BREACH` events when a client exhausts their quota
- [ ] Account lockout triggers `ACCOUNT_LOCKED` event with the locked email (hashed) and failure count
- [ ] Admin actions (unlock-account, role changes) emit `ADMIN_ACTION` events
- [ ] Events are non-blocking (fire-and-forget) to avoid impacting request latency

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Shared | Define `SecurityEvent` type and `SecurityEventType` enum | packages/shared/src/types.ts |
| Domain | Define `SecurityEventEmitter` port interface | packages/domain/src/ports/SecurityEventEmitter.ts |
| API | Implement `SecurityEventService` (structured logging + optional webhook) | packages/api/src/services/SecurityEventService.ts |
| API | Integrate with `RateLimitGuard` to emit `RATE_LIMIT_BREACH` on quota exhaustion | packages/api/src/common/guards/rate-limit.guard.ts |
| API | Integrate with `LoginUser` flow to emit `AUTH_FAILURE_SPIKE` on threshold breach | packages/api/src/controllers/auth.controller.ts |
| API | Integrate with account lockout to emit `ACCOUNT_LOCKED` | packages/api/src/controllers/auth.controller.ts |
| API | Integrate with admin controller to emit `ADMIN_ACTION` | packages/api/src/controllers/admin.controller.ts |
| API | Add configuration for thresholds and webhook URL | packages/api/src/main.ts |
| API | Unit tests for threshold detection and event emission | packages/api/src/services/SecurityEventService.test.ts |

**Dependencies**: E2-US05, E2-US04, E2-US15

**Complexity**: L

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Auth failure spike detected
  Given SECURITY_AUTH_FAILURE_THRESHOLD is 10
  When 11 failed login attempts occur within 15 minutes
  Then an AUTH_FAILURE_SPIKE event should be emitted
  And the event severity should be 'critical'

Scenario: Rate limit breach emits event
  Given a client has exhausted their rate limit quota
  When the next request is rejected with 429
  Then a RATE_LIMIT_BREACH event should be emitted
  And the event should include the client IP and endpoint

Scenario: Account lockout emits event
  Given a user has exceeded MAX_FAILED_ATTEMPTS
  When their account is locked
  Then an ACCOUNT_LOCKED event should be emitted
  And the event should include a hashed email (not plaintext)

Scenario: Webhook called on threshold breach
  Given SECURITY_WEBHOOK_URL is configured
  When an AUTH_FAILURE_SPIKE event is emitted
  Then a POST request should be sent to the webhook URL
  And the request body should contain the event payload

Scenario: Security events are non-blocking
  Given the webhook URL is unreachable
  When a security event is emitted
  Then the originating request should not be delayed
  And the webhook failure should be logged as a warning
```
