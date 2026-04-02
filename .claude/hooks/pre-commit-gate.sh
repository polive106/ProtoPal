#!/usr/bin/env bash
# Hook: Block git commit if lint or tests fail
# Trigger: PreToolUse on Bash commands containing "git commit"

set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Only intercept git commit commands
if ! echo "$COMMAND" | grep -qE '\bgit\s+commit\b'; then
  exit 0
fi

cd "$(git rev-parse --show-toplevel)"

echo "Pre-commit gate: running lint..." >&2
if ! pnpm lint 2>&1; then
  echo "BLOCKED: pnpm lint failed. Fix lint errors before committing." >&2
  exit 1
fi

echo "Pre-commit gate: running tests..." >&2
if ! pnpm test 2>&1; then
  echo "BLOCKED: pnpm test failed. Fix failing tests before committing." >&2
  exit 1
fi

echo "Pre-commit gate: all checks passed." >&2
exit 0
