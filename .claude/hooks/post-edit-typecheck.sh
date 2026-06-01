#!/usr/bin/env bash
# .claude/hooks/post-edit-typecheck.sh
#
# PostToolUse hook (Write|Edit|MultiEdit): when Claude edits a .ts or .tsx
# file, run tsc --noEmit in that workspace and feed errors back to Claude
# so it can fix them immediately.
#
# Exit 2 = send stderr to the model (it will try to fix the errors).
# Exit 0 = all good, nothing to report.

set -uo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // .inputs.file_path // empty' 2>/dev/null || echo "")

# Only act on TypeScript/TSX files
if [[ "$FILE" != *.ts && "$FILE" != *.tsx ]]; then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Determine which workspace the file belongs to
if [[ "$FILE" == *"/frontend/"* ]]; then
  WORKSPACE_DIR="$PROJECT_DIR/frontend"
elif [[ "$FILE" == *"/backend/"* ]]; then
  WORKSPACE_DIR="$PROJECT_DIR/backend"
else
  exit 0
fi

# Run typecheck
OUTPUT=$(cd "$WORKSPACE_DIR" && npx tsc --noEmit 2>&1) || {
  ERRORS=$(echo "$OUTPUT" | grep -E "error TS" | head -20)
  cat >&2 <<EOF
TypeScript errors detected after editing $FILE:

$ERRORS

Fix these type errors before proceeding.
EOF
  exit 2
}

exit 0
