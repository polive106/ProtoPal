#!/usr/bin/env bash
# Hook: After creating a story file, verify epic README and PRD are updated
# Trigger: PostToolUse on Write for new story files in docs/backlog/

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only check new story files (E*-US*.md pattern)
if ! echo "$FILE_PATH" | grep -qE 'docs/backlog/epic-[^/]+/E[0-9]+-US[0-9]+'; then
  exit 0
fi

# Extract story ID from filename (e.g., E2-US01 from E2-US01-some-slug.md)
STORY_ID=$(basename "$FILE_PATH" | grep -oE 'E[0-9]+-US[0-9]+')
if [ -z "$STORY_ID" ]; then
  exit 0
fi

# Find the epic directory
EPIC_DIR=$(dirname "$FILE_PATH")
EPIC_README="$EPIC_DIR/README.md"
REPO_ROOT=$(git rev-parse --show-toplevel)
PRD_README="$REPO_ROOT/docs/backlog/README.md"

WARNINGS=()

# Check epic README references this story
if [ -f "$EPIC_README" ]; then
  if ! grep -q "$STORY_ID" "$EPIC_README"; then
    WARNINGS+=("Epic README ($EPIC_README) does not reference $STORY_ID — add it to the story table")
  fi
else
  WARNINGS+=("Epic README ($EPIC_README) does not exist — create it with the story table")
fi

# Check PRD references this story
if [ -f "$PRD_README" ]; then
  if ! grep -q "$STORY_ID" "$PRD_README"; then
    WARNINGS+=("PRD ($PRD_README) does not reference $STORY_ID — add it to the implementation order")
  fi
fi

if [ ${#WARNINGS[@]} -gt 0 ]; then
  echo "WARNING: Backlog indexes are out of sync after creating $STORY_ID:" >&2
  for warning in "${WARNINGS[@]}"; do
    echo "  - $warning" >&2
  done
  exit 1
fi

exit 0
