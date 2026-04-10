# E7-US04: Response DTO Sanitization

**User Story**: As a platform operator, I want a structural guarantee that sensitive fields like password hashes and token versions are never serialized in API responses, so that future code changes cannot accidentally leak them.

**Acceptance Criteria**:
- [ ] A `toPublicUser()` or response-mapping function strips `passwordHash`, `tokenVersion`, and other internal fields
- [ ] All controller endpoints returning user data use the sanitization function
- [ ] Domain use-cases that return User objects are audited for leakage paths
- [ ] Validation error messages in production are generic (no field path details)
- [ ] Unit tests assert that sensitive fields are absent from every response path
- [ ] Integration test confirms password hash is never in any API response

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Shared | Add `PublicUser` type excluding sensitive fields | packages/shared/src/types.ts |
| API | Create `toPublicUser()` response mapper utility | packages/api/src/common/utils/to-public-user.ts |
| API | Apply `toPublicUser()` in auth controller (login, verify, me) | packages/api/src/controllers/auth.controller.ts |
| API | Optionally reduce validation error detail in production mode | packages/api/src/common/decorators/validated-body.decorator.ts |
| API | Unit tests for `toPublicUser()` and response shape | packages/api/src/common/utils/to-public-user.test.ts |
| E2E | Assert no sensitive fields in auth API responses | e2e/tests/auth/ |

**Dependencies**: None

**Complexity**: M

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Login response excludes sensitive fields
  Given I login with valid credentials
  When I inspect the response body
  Then the user object should not contain passwordHash or tokenVersion

Scenario: GET /auth/me excludes sensitive fields
  Given I am authenticated
  When I call GET /auth/me
  Then the response should not contain passwordHash or tokenVersion

Scenario: Verify response excludes sensitive fields
  Given I verify my email with a valid token
  When I inspect the response body
  Then the user object should not contain passwordHash or tokenVersion
```
