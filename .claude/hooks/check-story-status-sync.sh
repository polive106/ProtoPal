#!/usr/bin/env bash
# Hook: After editing a story file, verify the epic README status column matches
# Trigger: PostToolUse on Edit for story files in docs/backlog/

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only check story files (E*-US*.md pattern)
if ! echo "$FILE_PATH" | grep -qE 'docs/backlog/epic-[^/]+/E[0-9]+-US[0-9]+-.*\.md$'; then
  exit 0
fi

# Extract story ID from filename (e.g., E4-US03 from E4-US03-registeruser-parameter-sprawl.md)
STORY_ID=$(basename "$FILE_PATH" | grep -oE 'E[0-9]+-US[0-9]+')
if [ -z "$STORY_ID" ]; then
  exit 0
fi

# Read story status from the story file
STORY_STATUS=$(grep -oP '^\*\*Status\*\*:\s*\K\S+' "$FILE_PATH" || true)
if [ -z "$STORY_STATUS" ]; then
  exit 0
fi

# Find the epic README
EPIC_DIR=$(dirname "$FILE_PATH")
EPIC_README="$EPIC_DIR/README.md"

if [ ! -f "$EPIC_README" ]; then
  exit 0
fi

# Extract the status for this story from the epic README table row
# Table format: | E4-US03 | Title | Complexity | Status |
README_STATUS=$(grep "$STORY_ID" "$EPIC_README" | grep -oP '\|\s*\K(Pending|In Progress|Done|Blocked)\s*(?=\|)' | xargs || true)

if [ -z "$README_STATUS" ]; then
  exit 0
fi

if [ "$STORY_STATUS" != "$README_STATUS" ]; then
  echo "WARNING: Status mismatch for $STORY_ID:" >&2
  echo "  - Story file ($FILE_PATH): $STORY_STATUS" >&2
  echo "  - Epic README ($EPIC_README): $README_STATUS" >&2
  echo "  → Update the epic README status column to '$STORY_STATUS'" >&2
  exit 1
fi

exit 0
