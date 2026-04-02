# E1-US02: Auth System

**User Story**: As a user, I want to register and log in so that I can access protected features.

**Acceptance Criteria**:
- [x] Users can register with email, password, first name, last name
- [x] Password validation: 8+ chars, uppercase, lowercase, number
- [x] Users can log in with email/password
- [x] JWT token stored in HTTP-only cookie
- [x] Protected routes require authentication
- [x] /auth/me returns current user with roles
- [x] Users can log out (cookie cleared)
- [x] Login and register pages with responsive UI

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | User, Role, UserRole entities | packages/domain/src/entities/ |
| Domain | Repository ports | packages/domain/src/ports/ |
| Domain | RegisterUser use case + tests | packages/domain/src/use-cases/ |
| Domain | LoginUser use case + tests | packages/domain/src/use-cases/ |
| Database | Schema (users, roles, user_roles) | packages/database/src/schema.sqlite.ts |
| Database | Drizzle adapters + tests | packages/database/src/adapters/ |
| Database | Seed script | packages/database/src/seed.ts |
| API | AuthController (register, login, logout, me) | packages/api/src/controllers/ |
| API | AuthGuard, RolesGuard | packages/api/src/common/guards/ |
| API | JwtService, BcryptPasswordHasher | packages/api/src/services/ |
| Frontend | LoginForm, RegisterForm | packages/frontend/src/features/auth/ |
| Frontend | AuthProvider | packages/frontend/src/providers/ |
| Frontend | Login/Register routes | packages/frontend/src/routes/ |
| E2E | Login + Register tests | e2e/tests/auth/ |

**Dependencies**: E1-US02

**Complexity**: L

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: Successful registration
  Given I am on the register page
  When I fill in valid registration details
  And I click "Create Account"
  Then I should be redirected to the login page

Scenario: Successful login
  Given I am on the login page
  When I fill in valid credentials
  And I click "Sign In"
  Then I should be redirected to the dashboard

Scenario: Invalid login
  Given I am on the login page
  When I fill in invalid credentials
  And I click "Sign In"
  Then I should see an error message
```
