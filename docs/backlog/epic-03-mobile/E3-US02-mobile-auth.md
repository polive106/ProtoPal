# E3-US02: Mobile Auth

**User Story**: As a user, I want to log in and register on the mobile app so that I can access my data on the go.

**Acceptance Criteria**:
- [x] API auth guard accepts `Authorization: Bearer` header as fallback alongside cookies
- [x] AuthProvider with `expo-secure-store` token management
- [x] Login screen with email/password fields and validation
- [x] Register screen with name/email/password fields and validation
- [x] Authenticated layout with auth guard redirecting to login
- [x] Dashboard screen after successful login
- [x] Logout clears SecureStore and redirects to login
- [x] Feature-sliced architecture: `features/auth/{api,hooks,ui,schemas,index}.ts`
- [x] `testID` props on all interactive elements
- [x] Unit tests for auth hooks
- [x] Maestro E2E flows for login and registration

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| API | Add Bearer token fallback to auth guard | `packages/api/src/common/guards/auth.guard.ts` |
| API | Add auth guard test for Bearer token path | `packages/api/src/common/guards/auth.guard.test.ts` |
| Mobile | Create AuthProvider with SecureStore token management | `packages/mobile/src/providers/AuthProvider.tsx` |
| Mobile | Create auth API module (login, register, logout, getCurrentUser) | `packages/mobile/src/features/auth/api.ts` |
| Mobile | Create auth Zod schemas | `packages/mobile/src/features/auth/schemas.ts` |
| Mobile | Create auth hooks (useLogin, useLogout, useCurrentUser, useLoginForm, useRegistrationForm) | `packages/mobile/src/features/auth/hooks/` |
| Mobile | Create Login screen | `packages/mobile/app/(auth)/login.tsx`, `packages/mobile/src/features/auth/ui/LoginForm.tsx` |
| Mobile | Create Register screen | `packages/mobile/app/(auth)/register.tsx`, `packages/mobile/src/features/auth/ui/RegisterForm.tsx` |
| Mobile | Create authenticated layout with auth guard | `packages/mobile/app/(authenticated)/_layout.tsx` |
| Mobile | Create dashboard screen | `packages/mobile/app/(authenticated)/dashboard.tsx` |
| Mobile | Add `testID` props to all interactive elements | All auth components |
| Mobile | Unit tests for auth hooks | `packages/mobile/src/features/auth/hooks/*.test.ts` |
| Mobile | Unit tests for AuthProvider | `packages/mobile/src/providers/AuthProvider.test.tsx` |
| E2E Mobile | Login flow | `maestro/auth/login.yaml` |
| E2E Mobile | Register flow | `maestro/auth/register.yaml` |

**Dependencies**: E3-US01

**Complexity**: S

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: Mobile login with valid credentials
  Given I am on the login screen
  When I enter valid email and password
  And I tap the login button
  Then I should see the dashboard screen
  And my auth token should be stored in SecureStore

Scenario: Mobile login with invalid credentials
  Given I am on the login screen
  When I enter invalid email and password
  And I tap the login button
  Then I should see an error message

Scenario: Mobile registration
  Given I am on the register screen
  When I fill in name, email, and password
  And I tap the register button
  Then I should see the dashboard screen

Scenario: Unauthenticated redirect
  Given I am not logged in
  When the app launches
  Then I should be redirected to the login screen

Scenario: API accepts Bearer token
  Given a valid JWT token
  When I send a request with Authorization: Bearer header
  Then the API should authenticate the request

Scenario: Mobile logout
  Given I am logged in on the mobile app
  When I tap the logout button
  Then I should be redirected to the login screen
  And my auth token should be removed from SecureStore
```
