#!/usr/bin/env bash
# Hook: Validate story files have all required sections
# Trigger: PostToolUse on Edit/Write for docs/backlog/**/*.md (not READMEs)

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only check story files in docs/backlog (not READMEs or epic overviews)
if ! echo "$FILE_PATH" | grep -qE 'docs/backlog/epic-[^/]+/E[0-9]'; then
  exit 0
fi

# Skip if file doesn't exist (was deleted)
if [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

MISSING=()

grep -q '^\*\*User Story\*\*' "$FILE_PATH" || MISSING+=("User Story")
grep -q '^\*\*Acceptance Criteria\*\*' "$FILE_PATH" || MISSING+=("Acceptance Criteria")
grep -q '^\*\*Technical Tasks\*\*' "$FILE_PATH" || MISSING+=("Technical Tasks")
grep -q '^\*\*Dependencies\*\*' "$FILE_PATH" || MISSING+=("Dependencies")
grep -q '^\*\*Complexity\*\*' "$FILE_PATH" || MISSING+=("Complexity")
grep -q '^\*\*Status\*\*' "$FILE_PATH" || MISSING+=("Status")
grep -q '^\*\*Test Scenarios\*\*' "$FILE_PATH" || MISSING+=("Test Scenarios")

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "WARNING: Story file $FILE_PATH is missing required sections:" >&2
  for section in "${MISSING[@]}"; do
    echo "  - $section" >&2
  done
  echo "Required sections: User Story, Acceptance Criteria, Technical Tasks, Dependencies, Complexity, Status, Test Scenarios" >&2
  exit 1
fi

exit 0
