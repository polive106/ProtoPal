# E8-US06: Admin Endpoint Input Validation

**User Story**: As a platform operator, I want admin endpoints to validate their input parameters so that malformed data cannot cause unexpected behavior or be used for injection attacks.

**Security Finding**: The `POST /admin/unlock-account/:email` endpoint accepts the email as a raw URL path parameter without any validation (`packages/api/src/controllers/admin.controller.ts` line 27). The email string is passed directly to `loginAttemptRepo.unlockAccount(email)` and included in audit log metadata. There is no:
- Email format validation
- Length limit check
- Sanitization before database query or logging

While the admin endpoint requires authentication and the `admin` role, defense-in-depth dictates that all inputs should be validated regardless of the caller's privilege level.

**Current State**:
- `packages/api/src/controllers/admin.controller.ts` line 27 — `@Param('email') email: string`
- No DTO validation pipe applied
- Email is used in DB query and audit log without sanitization

**Acceptance Criteria**:
- [ ] Admin unlock endpoint validates email format and length (max 254 chars per RFC 5321)
- [ ] Invalid email format returns 400 Bad Request
- [ ] Validation uses the same email schema as auth DTOs for consistency
- [ ] Audit log entry includes the validated email
- [ ] Unit test for invalid email rejection

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add email validation pipe or move email to request body with DTO | packages/api/src/controllers/admin.controller.ts |
| API | Add admin DTO schema with email validation | packages/api/src/controllers/dto/admin.dto.ts |
| API | Integration test for invalid email | packages/api/src/controllers/admin.controller.integration.test.ts |

**Dependencies**: None

**Complexity**: XS

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Admin unlock rejects invalid email format
  Given I am logged in as admin
  When I call POST /admin/unlock-account with email "not-an-email"
  Then I receive a 400 Bad Request

Scenario: Admin unlock rejects oversized email
  Given I am logged in as admin
  When I call POST /admin/unlock-account with a 300-character email
  Then I receive a 400 Bad Request
```
