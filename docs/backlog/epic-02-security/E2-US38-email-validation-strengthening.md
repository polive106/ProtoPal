# E2-US38: Email Validation Strengthening

**User Story**: As a platform operator, I want email validation to use a robust, standards-compliant pattern so that obviously invalid email addresses are rejected at registration and the system is not polluted with unusable accounts.

**Acceptance Criteria**:
- [ ] Email validation uses a stricter regex or dedicated validation library that rejects clearly invalid formats (e.g., `a@b.c`, `@domain.com`, `user@.com`)
- [ ] Email validation is consistent across all layers: domain, API (shared schema), and frontend/mobile
- [ ] The shared email validation schema in `@acme/shared` is the single source of truth
- [ ] Existing valid email formats continue to pass validation
- [ ] Edge cases are tested: internationalized domain names, plus-addressing (`user+tag@domain.com`), long TLDs

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | Replace simplistic email regex with stricter validation in `RegisterUser` | packages/domain/src/use-cases/RegisterUser.ts |
| Shared | Update shared email schema with improved regex | packages/shared/src/schemas/auth.ts |
| Domain | Extract email validation to a reusable `validateEmail()` function | packages/domain/src/validation/ |
| Domain | Unit tests for edge cases (valid and invalid emails) | packages/domain/src/validation/ |
| Shared | Unit tests for shared email schema | packages/shared/src/ |
| E2E | Verify invalid emails are rejected at registration | e2e/tests/auth.api.spec.ts |

**Dependencies**: None

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: Obviously invalid emails are rejected
  Given I try to register with email "a@b.c"
  Then registration should fail with a validation error

Scenario: Missing local part is rejected
  Given I try to register with email "@domain.com"
  Then registration should fail with a validation error

Scenario: Valid emails are accepted
  Given I try to register with email "user@example.com"
  Then registration should proceed normally

Scenario: Plus-addressing is accepted
  Given I try to register with email "user+tag@example.com"
  Then registration should proceed normally

Scenario: Email validation is consistent across layers
  Given the shared schema validates email format
  When the domain layer validates the same email
  Then both produce the same result
```
