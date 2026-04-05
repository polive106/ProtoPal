# E2-US08: Input Validation Hardening & Payload Size Limits

**User Story**: As a platform operator, I want all user inputs to have strict length limits and the server to reject oversized payloads so that the application is protected against denial-of-service via large inputs and silent data truncation.

**Acceptance Criteria**:
- [ ] Password has a maximum length of 72 characters (bcrypt's internal limit) enforced at the API and domain layers
- [ ] Note title has a maximum length of 255 characters
- [ ] Note content has a maximum length of 50,000 characters
- [ ] First name and last name have a maximum length of 100 characters each
- [ ] Email has a maximum length of 254 characters (RFC 5321 limit)
- [ ] Express body-parser has a `limit` of 1MB configured in `main.ts`
- [ ] Frontend Zod schemas mirror the same max-length constraints
- [ ] API returns clear validation errors when limits are exceeded
- [ ] Existing tests still pass with new constraints

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add `.max(72)` to password in auth DTO schemas | packages/api/src/controllers/dto/auth.dto.ts |
| API | Add `.max(254)` to email, `.max(100)` to name fields in register schema | packages/api/src/controllers/dto/auth.dto.ts |
| API | Add `.max(255)` to title, `.max(50000)` to content in notes DTO schemas | packages/api/src/controllers/dto/notes.dto.ts |
| API | Configure Express JSON body-parser with 1MB limit | packages/api/src/main.ts |
| Domain | Add max-length check to `validatePassword()` in RegisterUser | packages/domain/src/use-cases/RegisterUser.ts |
| Domain | Add max-length checks to `validateEmail()` and `validateNames()` | packages/domain/src/use-cases/RegisterUser.ts |
| Frontend | Mirror max-length constraints in auth Zod schemas | packages/frontend/src/features/auth/schemas.ts |
| Frontend | Mirror max-length constraints in notes Zod schemas | packages/frontend/src/features/notes/schemas.ts |
| Shared | Add max-length constants to shared package for reuse | packages/shared/src/constants.ts |
| Domain | Unit tests for max-length rejections | packages/domain/src/use-cases/RegisterUser.test.ts |
| API | Integration tests for oversized payloads | packages/api/src/controllers/auth.controller.integration.test.ts |
| E2E | Validation error test for oversized inputs | e2e/tests/notes.api.spec.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Password exceeding 72 characters is rejected
  Given a registration request with a 73-character password
  When I submit the registration form
  Then the response should be 400 Bad Request
  And the error should mention password length limit

Scenario: Note with oversized content is rejected
  Given a note creation request with content exceeding 50,000 characters
  When I submit the note
  Then the response should be 400 Bad Request

Scenario: Oversized request body is rejected
  Given a request with a body larger than 1MB
  When I send it to any endpoint
  Then the response should be 413 Payload Too Large

Scenario: bcrypt truncation is prevented
  Given two passwords that differ only after the 72nd character
  When I register with the first and login with the second
  Then login should fail (passwords are treated as different)
```
