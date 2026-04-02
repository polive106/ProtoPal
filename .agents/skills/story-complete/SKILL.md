---
name: story-complete
description: Verify a story is complete by checking acceptance criteria, running all tests, and updating status.
disable-model-invocation: true
---

## Checklist

1. **Story file**: All acceptance criteria checkboxes are checked
2. **Status**: Story status set to "Done"
3. **Tests pass**:
   ```bash
   pnpm lint
   pnpm test
   pnpm test:e2e
   ```
4. **USER_FEATURES.md**: Updated with new features for affected user types
5. **Seed data**: Updated if new entities were added
6. **Backlog**: Check if this unblocks any dependent stories

## Steps

1. Read the story file from `docs/backlog/`
2. Verify each acceptance criterion is met
3. Run all tests
4. Update the story status to "Done"
5. Update `USER_FEATURES.md`
6. Run `/review-backlog` to identify next work
