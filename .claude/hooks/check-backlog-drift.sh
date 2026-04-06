#!/usr/bin/env bash
# Hook: On session start, detect stories whose implementation exists but status is still Pending.
# Also detects status mismatches between story files and epic READMEs.
# Trigger: SessionStart (runs once at the beginning of each session)

set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
BACKLOG_DIR="$REPO_ROOT/docs/backlog"

if [ ! -d "$BACKLOG_DIR" ]; then
  exit 0
fi

WARNINGS=()

# --- Check 1: Status mismatches between story files and epic READMEs ---
for EPIC_DIR in "$BACKLOG_DIR"/epic-*/; do
  [ -d "$EPIC_DIR" ] || continue
  EPIC_README="$EPIC_DIR/README.md"
  [ -f "$EPIC_README" ] || continue

  for STORY_FILE in "$EPIC_DIR"/E*-US*.md; do
    [ -f "$STORY_FILE" ] || continue
    [ "$(basename "$STORY_FILE")" = "README.md" ] && continue

    STORY_ID=$(basename "$STORY_FILE" | grep -oE 'E[0-9]+-US[0-9]+' || true)
    [ -z "$STORY_ID" ] && continue

    # Get status from story file
    STORY_STATUS=$(grep -oP '^\*\*Status\*\*:\s*\K\S+' "$STORY_FILE" 2>/dev/null || true)
    [ -z "$STORY_STATUS" ] && continue

    # Get status from epic README
    README_STATUS=$(grep "$STORY_ID" "$EPIC_README" | grep -oP '\|\s*\K(Pending|In Progress|Done|Blocked)\s*(?=\|)' | xargs 2>/dev/null || true)
    [ -z "$README_STATUS" ] && continue

    if [ "$STORY_STATUS" != "$README_STATUS" ]; then
      WARNINGS+=("Status mismatch: $STORY_ID story file says '$STORY_STATUS' but epic README says '$README_STATUS'")
    fi
  done
done

# --- Check 2: Pending stories with checked acceptance criteria ---
for EPIC_DIR in "$BACKLOG_DIR"/epic-*/; do
  [ -d "$EPIC_DIR" ] || continue

  for STORY_FILE in "$EPIC_DIR"/E*-US*.md; do
    [ -f "$STORY_FILE" ] || continue
    [ "$(basename "$STORY_FILE")" = "README.md" ] && continue

    STORY_ID=$(basename "$STORY_FILE" | grep -oE 'E[0-9]+-US[0-9]+' || true)
    [ -z "$STORY_ID" ] && continue

    STORY_STATUS=$(grep -oP '^\*\*Status\*\*:\s*\K\S+' "$STORY_FILE" 2>/dev/null || true)

    # Only check Pending/In Progress stories
    if [ "$STORY_STATUS" = "Done" ] || [ "$STORY_STATUS" = "Blocked" ]; then
      continue
    fi

    # Count checked vs unchecked acceptance criteria
    CHECKED=$(grep -c '^\- \[x\]' "$STORY_FILE" 2>/dev/null || true)
    UNCHECKED=$(grep -c '^\- \[ \]' "$STORY_FILE" 2>/dev/null || true)
    CHECKED=${CHECKED:-0}
    UNCHECKED=${UNCHECKED:-0}
    TOTAL=$((CHECKED + UNCHECKED))

    if [ "$TOTAL" -gt 0 ] && [ "$UNCHECKED" -eq 0 ] && [ "$CHECKED" -gt 0 ]; then
      WARNINGS+=("Drift: $STORY_ID is marked '$STORY_STATUS' but ALL $CHECKED acceptance criteria are checked → should be Done")
    elif [ "$TOTAL" -gt 0 ] && [ "$CHECKED" -gt 0 ] && [ "$UNCHECKED" -gt 0 ]; then
      PCT=$((CHECKED * 100 / TOTAL))
      if [ "$PCT" -ge 75 ]; then
        WARNINGS+=("Drift: $STORY_ID is marked '$STORY_STATUS' but $CHECKED/$TOTAL acceptance criteria are checked ($PCT%) → verify status")
      fi
    fi
  done
done

if [ ${#WARNINGS[@]} -gt 0 ]; then
  echo "Backlog drift detected:" >&2
  for warning in "${WARNINGS[@]}"; do
    echo "  ⚠ $warning" >&2
  done
  echo "" >&2
  echo "Run /review-backlog to investigate, or /story-complete to update statuses." >&2
  exit 1
fi

exit 0
