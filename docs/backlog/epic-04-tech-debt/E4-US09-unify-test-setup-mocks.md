# E4-US09: Unify Test Setup Mocks Across Frontend and Mobile

**User Story**: As a developer, I want i18n test mocks defined once so that both platforms test against the same mock behavior and regressions are caught consistently.

**Acceptance Criteria**:
- [ ] A shared mock factory is exported from `@acme/i18n` (e.g., `@acme/i18n/testing` or `@acme/i18n/vitest-mock`) providing: mocked `i18n` instance, `t` function, `isSupportedLng`, `translateApiError`, `supportedLngs`
- [ ] Frontend `test-setup.ts` imports and uses the shared mock factory instead of defining its own
- [ ] Mobile `test-setup.ts` imports and uses the shared mock factory instead of defining its own
- [ ] `translateApiError` mock behavior is consistent: both platforms either do a real lookup against the mocked `errors` namespace or return a predictable test value (currently frontend does a real lookup, mobile returns `error.message` unconditionally)

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| i18n | Create shared test mock factory | `packages/i18n/src/testing.ts` (new) |
| i18n | Export testing utilities from package | `packages/i18n/package.json` (exports field) |
| Frontend | Replace local i18n mock with shared factory | `packages/frontend/src/test-setup.ts` |
| Mobile | Replace local i18n mock with shared factory | `packages/mobile/src/test-setup.ts` |

**Dependencies**: None

**Complexity**: S

**Status**: To Do

**Test Scenarios**:
```gherkin
Scenario: Consistent translateApiError mock behavior
  Given both frontend and mobile use the shared i18n mock factory
  When translateApiError is called with an error that has an errorKey
  Then both platforms return the same translated string

Scenario: Adding a new i18n mock utility
  Given the shared factory exists in @acme/i18n/testing
  When a new i18n utility is added (e.g., formatDate)
  Then the mock is added once in the shared factory
  And both test setups pick it up automatically
```
