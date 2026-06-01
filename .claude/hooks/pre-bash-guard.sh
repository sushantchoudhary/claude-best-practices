#!/usr/bin/env bash
# .claude/hooks/pre-bash-guard.sh
#
# PreToolUse hook: read the proposed bash command from stdin and block
# anything that looks destructive before it executes.
#
# Exit 2 = block the command and feed stderr back to the model.
# Exit 0 = allow it.

set -euo pipefail

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || echo "")

if [ -z "$CMD" ]; then
  exit 0
fi

# ── Patterns that are always blocked ────────────────────────────────────────
BLOCKED_PATTERNS=(
  'rm[[:space:]]+-[rf]*[rf][[:space:]]'  # rm -rf / rm -fr
  'rm[[:space:]]+-[rf]*[[:space:]]/'     # rm -r /absolute-path
  'git[[:space:]]+push[[:space:]]+--force'
  'git[[:space:]]+push[[:space:]]+-f'
  'git[[:space:]]+reset[[:space:]]+--hard[[:space:]]+HEAD~'
  'git[[:space:]]+clean[[:space:]]+-fd'
  'DROP[[:space:]]+TABLE'
  'DROP[[:space:]]+DATABASE'
  'chmod[[:space:]]+777'
  'curl[^|]*\|[[:space:]]*(bash|sh)'   # curl | bash
  'wget[^|]*\|[[:space:]]*(bash|sh)'   # wget | sh
  ':(){:|:&};:'                          # fork bomb
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$CMD" | grep -qiE "$pattern"; then
    cat >&2 <<EOF
BLOCKED by pre-bash-guard: dangerous pattern detected.
  Pattern : $pattern
  Command : $CMD

If you intended this, request human approval or run it manually.
EOF
    exit 2
  fi
done

# ── Log allowed commands (async, non-blocking) ───────────────────────────────
echo "[$(date -Iseconds)] ALLOWED: $CMD" >> /tmp/claude-code-demo-bash.log 2>/dev/null || true

exit 0
