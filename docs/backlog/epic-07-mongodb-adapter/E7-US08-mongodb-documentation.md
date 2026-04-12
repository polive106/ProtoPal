# E7-US08: MongoDB Documentation

**User Story**: As a developer forking ProtoPal, I want clear documentation on how to configure and use MongoDB so that I can switch database backends without reading the source code.

**Acceptance Criteria**:
- [ ] `docs/mongodb.md` guide covers: prerequisites, setup, configuration, running the setup script, and verifying the connection
- [ ] Environment variable reference documents `MONGODB_URL` format and examples
- [ ] Guide explains the adapter architecture and how SQL/Mongo selection works
- [ ] Troubleshooting section covers common issues (connection refused, auth failures, index conflicts)
- [ ] `README.md` updated with a brief mention of MongoDB support and link to the guide

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Docs | Create `docs/mongodb.md` with full setup and usage guide | docs/mongodb.md |
| Docs | Add MongoDB section to project README | README.md |
| Config | Ensure `.env.example` has documented `MONGODB_URL` with comment | .env.example |

**Dependencies**: E7-US07

**Complexity**: XS

**Status**: Done

**Test Scenarios**:
```gherkin
Scenario: Developer follows the MongoDB guide
  Given a fresh clone of ProtoPal
  And MongoDB is running locally
  When the developer follows the steps in docs/mongodb.md
  Then the application starts with MongoDB as the backend
  And registration, login, and notes CRUD all work

Scenario: Developer switches back to SQL
  Given the application was running with MongoDB
  When the developer unsets MONGODB_URL
  And restarts the application
  Then it falls back to SQLite and works correctly
```
