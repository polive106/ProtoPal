---
name: review-backlog
description: Review the backlog to determine what to work on next by checking epic and story statuses in docs/backlog/.
---

## Steps

1. Read `docs/backlog/README.md` to understand the implementation order
2. Check each epic folder under `docs/backlog/` for story statuses
3. Identify the next story to implement based on:
   - Implementation order defined in the PRD
   - Dependencies between stories
   - Current status (skip Done stories)

## Drift Detection

For each story marked **Pending** or **In Progress**, run a quick sanity check to detect status drift:

4. Read the story file's **Technical Tasks** table to get the key implementation files
5. Check if those files exist in the codebase (use Glob or Bash `test -f`)
6. If **all or most key files exist** for a Pending story, flag it as a potential drift:
   ```
   ⚠ DRIFT: E2-US04 is marked Pending but implementation files exist:
     - packages/domain/src/use-cases/AccountLockout.ts ✓
     - packages/api/src/common/guards/lockout.guard.ts ✓
     → Run /story-complete to verify and update status
   ```
7. Also check for status mismatches between:
   - Story file `**Status**:` field vs Epic README table
   - Epic README vs PRD README phase status
   - Story acceptance criteria checkboxes (all checked but status != Done)

## Output Format

```
## Backlog Status

### Phase 1: Foundation (Done)
- [x] E1-US01: Project Setup (Done)
...

### Drift Warnings
⚠ E2-US04: Marked Pending but 5/7 implementation files exist → verify with /story-complete
⚠ E3-US02: Story file says Done but Epic README says Pending → sync statuses

### Next Up
<next story to implement>
```

## Notes
- Stories must be implemented in dependency order
- A story is "Done" only when all acceptance criteria AND E2E tests pass
- Drift detection prevents stale statuses from accumulating
