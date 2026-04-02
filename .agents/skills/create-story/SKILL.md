---
name: create-story
description: Create a new user story in the backlog with technical tasks, test scenarios, and epic integration.
---

## Input
The user provides (or this is invoked from `/discuss-feature`):
- Story title and user story statement
- Acceptance criteria
- Target epic (existing or new)
- Complexity estimate
- Dependencies (if known)

The agent derives everything else by analyzing the codebase.

## Steps

### Phase 1: Codebase Analysis
1. Read the existing backlog (`docs/backlog/README.md`, epic READMEs) to understand current state
2. Read the codebase to understand existing patterns, entities, and architecture
3. Based on the acceptance criteria, determine:
   - Which layers are affected (Domain, Database, API, Frontend, E2E)
   - What entities, repositories, controllers, components, routes need to be created or modified
   - Specific file paths following existing naming conventions
   - What migrations are needed (if any)
   - Test scenarios in Gherkin format

### Phase 2: Epic Setup (if new epic is needed)
4. Determine the next epic number by scanning `docs/backlog/` directories
5. Create `docs/backlog/epic-NN-<slug>/README.md` following the format of `docs/backlog/epic-01-foundation/README.md`

### Phase 3: Story Creation
6. Determine the next story ID within the epic (e.g., `E2-US08`)
7. Generate the full story file including agent-derived technical tasks and test scenarios
8. Create `docs/backlog/epic-NN-<slug>/EN-USXX-<slug>.md` using the template below
9. Update the epic's `README.md` story table with the new entry
10. Update `docs/backlog/README.md` implementation order with the new story

### Phase 4: Validation
11. Verify all dependency references point to existing stories
12. Verify story IDs are unique and sequential
13. Present the created file(s) to the user for review

## Story Template

```
# EN-USXX: <Title>

**User Story**: As a <role>, I want <feature> so that <benefit>.

**Acceptance Criteria**:
- [ ] <criterion 1>
- [ ] <criterion 2>

**Technical Tasks**:
| Layer | Task | File(s) |
|-------|------|---------|
| Domain | ... | ... |
| Database | ... | ... |
| API | ... | ... |
| Frontend | ... | ... |
| E2E | ... | ... |

**Dependencies**: <story IDs or "None">

**Complexity**: <XS/S/M/L/XL>

**Status**: Pending

**Test Scenarios**:
```gherkin
Scenario: ...
  Given ...
  When ...
  Then ...
```
```

## Notes
- Always use the naming conventions from `docs/backlog/README.md`
- Column naming for any new DB fields: `snake_case`
- Story complexity uses the reference table in the PRD
