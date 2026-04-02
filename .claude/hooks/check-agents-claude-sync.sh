#!/usr/bin/env bash
# Hook: After editing AGENTS.md or CLAUDE.md, check skill tables are in sync
# Trigger: PostToolUse on Edit for AGENTS.md or CLAUDE.md

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

REPO_ROOT=$(git rev-parse --show-toplevel)
AGENTS_FILE="$REPO_ROOT/AGENTS.md"
CLAUDE_FILE="$REPO_ROOT/CLAUDE.md"

# Only trigger on AGENTS.md or CLAUDE.md edits
case "$FILE_PATH" in
  */AGENTS.md|*/CLAUDE.md) ;;
  *) exit 0 ;;
esac

# Both files must exist
if [ ! -f "$AGENTS_FILE" ] || [ ! -f "$CLAUDE_FILE" ]; then
  exit 0
fi

# Extract skill names from each file (backtick-wrapped names in table rows)
AGENTS_SKILLS=$(grep -oE '`[a-z][-a-z]+`' "$AGENTS_FILE" | sort -u)
CLAUDE_SKILLS=$(grep -oE '`[a-z][-a-z]+`' "$CLAUDE_FILE" | sort -u)

# Compare
ONLY_IN_AGENTS=$(comm -23 <(echo "$AGENTS_SKILLS") <(echo "$CLAUDE_SKILLS"))
ONLY_IN_CLAUDE=$(comm -13 <(echo "$AGENTS_SKILLS") <(echo "$CLAUDE_SKILLS"))

WARNINGS=()

if [ -n "$ONLY_IN_AGENTS" ]; then
  WARNINGS+=("Skills in AGENTS.md but missing from CLAUDE.md: $ONLY_IN_AGENTS")
fi

if [ -n "$ONLY_IN_CLAUDE" ]; then
  WARNINGS+=("Skills in CLAUDE.md but missing from AGENTS.md: $ONLY_IN_CLAUDE")
fi

if [ ${#WARNINGS[@]} -gt 0 ]; then
  echo "WARNING: Skill tables are out of sync between AGENTS.md and CLAUDE.md:" >&2
  for warning in "${WARNINGS[@]}"; do
    echo "  - $warning" >&2
  done
  echo "Update both files to keep them in sync." >&2
  exit 1
fi

exit 0
