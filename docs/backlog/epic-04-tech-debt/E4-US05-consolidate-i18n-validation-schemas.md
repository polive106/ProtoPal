# E4-US05: Consolidate Validation Schemas with i18n Support

**User Story**: As a developer, I want validation schemas with i18n keys defined once so that both frontend and mobile display translated validation errors without maintaining divergent schema copies.

**Acceptance Criteria**:
- [ ] Auth schemas (`loginSchema`, `registrationSchema`, `forgotPasswordSchema`, `resetPasswordSchema`) use i18n translation keys and live in a single shared location
- [ ] Note schemas (`noteSchema`) use i18n translation keys and live in a single shared location
- [ ] Mobile auth and note schemas consume the shared i18n-keyed schemas (currently mobile still uses plain English strings from `@acme/shared`)
- [ ] `getFieldError` utility that resolves `validation.*` keys via `i18n.t()` is shared or duplicated consistently across frontend and mobile
- [ ] Dead plain-English validation messages in `@acme/shared/schemas/auth.ts` are removed or replaced
- [ ] Existing tests pass on both platforms

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Shared/i18n | Move i18n-keyed auth schemas to a shared location (e.g., `@acme/shared` or `@acme/i18n`) | `packages/shared/src/schemas/auth.ts` or new file |
| Shared/i18n | Move i18n-keyed note schema to the same shared location | new file alongside auth schemas |
| Frontend | Re-export shared i18n-keyed schemas instead of local redefinitions | `packages/frontend/src/features/auth/schemas.ts` |
| Frontend | Re-export shared note schema | `packages/frontend/src/features/notes/schemas.ts` |
| Mobile | Switch to shared i18n-keyed schemas | `packages/mobile/src/features/auth/schemas.ts` |
| Mobile | Switch to shared i18n-keyed note schema | `packages/mobile/src/features/notes/schemas.ts` |
| Mobile | Update `getFieldError` to resolve `validation.*` keys via `i18n.t()` (match frontend behavior) | `packages/mobile/src/lib/formUtils.ts` |

**Dependencies**: E4-US04 (i18n infrastructure should be unified first)

**Complexity**: M

**Status**: To Do

**Test Scenarios**:
```gherkin
Scenario: Mobile displays translated validation errors
  Given the user's language is set to French
  When a mobile user submits a login form with an empty email
  Then the validation error is displayed in French

Scenario: Schema consistency across platforms
  Given the shared auth schema defines emailField with key 'validation.emailRequired'
  When frontend and mobile both import and use the schema
  Then both platforms produce the same validation key for a missing email
```
