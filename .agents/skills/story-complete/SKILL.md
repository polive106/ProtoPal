---
name: story-complete
description: Verify a story is complete by checking acceptance criteria, running all tests, and updating status.
disable-model-invocation: true
---

## Checklist

1. **Story file**: All acceptance criteria checkboxes are checked
2. **Status**: Story status set to "Done"
3. **Epic README**: Epic README status column updated to "Done"
4. **Tests pass** — do **not** re-run suites that already passed.
   `/commit` runs the gate (`pnpm lint` + `pnpm test` + `pnpm test:e2e`) once, after
   `/simplify` and `/review`, and commits on that result. If nothing has changed since,
   carry it forward and skip to step 5.

   Re-run only what the intervening edits touched:
   | Changed since the last green run | Run |
   |---|---|
   | Nothing | nothing — reuse the recorded result |
   | Docs / story files only | nothing |
   | One package's source | `pnpm --filter @acme/<pkg> test` |
   | API or domain behaviour | `pnpm test:e2e:api` |
   | Frontend routes/components | `pnpm test:e2e:web` |
   | Broad or unclear | `pnpm lint && pnpm test && pnpm test:e2e` |
5. **USER_FEATURES.md**: Updated with new features for affected user types
6. **Seed data**: Updated if new entities were added
7. **Backlog**: Check if this unblocks any dependent stories

## Steps

1. Read the story file from `docs/backlog/`
2. Verify each acceptance criterion is met
3. Run all tests
4. Update the story status to "Done"
5. Update the epic README status column to "Done"
6. Update `USER_FEATURES.md`
7. Run `/review-backlog` to identify next work
