---
name: implement-story
description: Implement a backlog story following the layer order (Domain, Database, API, Frontend, E2E) with TDD.
disable-model-invocation: true
---

## Steps

1. **Read the story** — read the story file from `docs/backlog/`
2. **Understand the acceptance criteria** — every checkbox must be satisfied
3. **Follow layer order** — Domain → Database → API → Frontend → E2E
4. **TDD for each layer**:
   - Write failing test
   - Write minimum implementation
   - Verify test passes
   - Refactor if needed
5. **Add E2E tests** — use `/add-e2e-tests` skill
6. **Verify everything passes**:
   ```bash
   pnpm lint
   pnpm test
   pnpm test:e2e
   ```
7. **Update story status** — mark checkboxes and set status to "Done"
8. **Update USER_FEATURES.md** — add new features for affected user types

## Example: Implementing a Note use case

```bash
# 1. Write domain test
packages/domain/src/use-cases/__tests__/CreateNote.test.ts

# 2. Write domain implementation
packages/domain/src/use-cases/CreateNote.ts

# 3. Write database test
packages/database/src/adapters/__tests__/DrizzleNoteRepository.test.ts

# 4. Write database adapter
packages/database/src/adapters/DrizzleNoteRepository.ts

# 5. Wire up API controller
packages/api/src/controllers/notes.controller.ts

# 6. Build frontend feature
packages/frontend/src/features/notes/

# 7. Add E2E tests
e2e/tests/notes/crud.spec.ts
```

## Definition of Done
- [ ] All acceptance criteria checked
- [ ] Unit tests pass (`pnpm test`)
- [ ] Lint passes (`pnpm lint`)
- [ ] E2E tests pass (`pnpm test:e2e`)
- [ ] Story status updated to "Done"
- [ ] USER_FEATURES.md updated
