#!/usr/bin/env bash
# .claude/hooks/post-edit-lint.sh
#
# PostToolUse hook (Write|Edit|MultiEdit): auto-lint TypeScript/TSX files
# after every write. We use --fix so minor style issues are resolved
# automatically; only unfixable errors come back to the model.
#
# Exit 2 = send errors to model.
# Exit 0 = clean (or auto-fixed).

set -uo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // .inputs.file_path // empty' 2>/dev/null || echo "")

if [[ "$FILE" != *.ts && "$FILE" != *.tsx ]]; then
  exit 0
fi

# Don't lint test setup or generated files
if [[ "$FILE" == *"/tests/setup"* || "$FILE" == *"/dist/"* || "$FILE" == *".eslintrc"* ]]; then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

if [[ "$FILE" == *"/frontend/"* ]]; then
  WORKSPACE_DIR="$PROJECT_DIR/frontend"
elif [[ "$FILE" == *"/backend/"* ]]; then
  WORKSPACE_DIR="$PROJECT_DIR/backend"
else
  exit 0
fi

# Run ESLint with --fix; capture unfixable errors
OUTPUT=$(cd "$WORKSPACE_DIR" && npx eslint "$FILE" --fix --max-warnings=0 2>&1) || {
  cat >&2 <<EOF
ESLint errors in $FILE (auto-fix was applied but these remain):

$OUTPUT

Fix the linting errors before proceeding.
EOF
  exit 2
}

exit 0
