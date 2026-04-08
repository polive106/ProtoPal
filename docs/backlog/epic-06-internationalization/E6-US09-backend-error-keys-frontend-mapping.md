# E6-US09: Backend Error Keys & Frontend Error Mapping

**User Story**: As a user, I want API error messages to display in my chosen language so that validation and server errors are understandable regardless of locale.

**Acceptance Criteria**:
- [ ] API error responses include an `errorKey` field alongside the existing `message` field
- [ ] `errorKey` values follow a consistent naming convention (e.g., `auth.invalid_credentials`)
- [ ] Error key constants are defined in `@acme/shared` for use by both API and frontends
- [ ] Frontend maps `errorKey` to translated strings via `t()`, falling back to `message` if key is missing
- [ ] Mobile maps `errorKey` the same way
- [ ] Zod validation error messages on the frontend are translated via `t()` (using custom error maps or field-level messages)
- [ ] Auth error scenarios (invalid login, duplicate email, etc.) display translated errors
- [ ] Existing E2E tests pass without modification

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Shared | Define error key constants | packages/shared/src/error-keys.ts |
| Shared | Export error keys from package index | packages/shared/src/index.ts |
| API | Add `errorKey` to exception filters / error responses | packages/api/src/filters/, packages/api/src/modules/auth/ |
| API | Use error key constants in auth controller/service | packages/api/src/modules/auth/auth.controller.ts, packages/api/src/modules/auth/auth.service.ts |
| Frontend | Create error translation utility (maps errorKey → t()) | packages/frontend/src/utils/error-translation.ts |
| Frontend | Integrate error translation in auth hooks | packages/frontend/src/features/auth/hooks/ |
| Frontend | Translate Zod validation messages using custom error map or t() | packages/frontend/src/features/auth/schemas.ts |
| Mobile | Integrate same error translation pattern | packages/mobile/src/features/auth/hooks/ |
| Mobile | Translate Zod validation messages | packages/mobile/src/features/auth/schemas.ts |
| i18n | Add error namespace or error keys to auth namespace | packages/i18n/locales/en/auth.json, packages/i18n/locales/fr/auth.json |

**Dependencies**: E6-US03, E6-US06

**Complexity**: S

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: API returns errorKey with error response
  Given I send invalid login credentials
  When the API responds with 401
  Then the response body includes "errorKey": "auth.invalid_credentials"
  And the response body includes "message": "Invalid credentials"

Scenario: Frontend displays translated error
  Given the app language is set to French
  When I submit invalid login credentials
  Then the error message displays in French (e.g., "Identifiants invalides")

Scenario: Frontend falls back to message when errorKey is missing
  Given the API returns an error without an errorKey
  When the frontend processes the error
  Then it displays the raw message field

Scenario: Zod validation errors display in current locale
  Given the app language is set to French
  When I submit a login form with an empty email
  Then the validation error displays in French (e.g., "L'email est requis")

Scenario: Existing E2E tests pass
  Given error keys are integrated
  When I run the full E2E suite
  Then all tests pass
```
