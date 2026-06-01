#!/usr/bin/env bash
# .claude/hooks/log-failure.sh
#
# PostToolUseFailure hook (Bash): log every failed bash command so the
# team can review what went wrong during an agent session.

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || echo "unknown")
ERROR=$(echo "$INPUT" | jq -r '.response // empty' 2>/dev/null || echo "")

LOG_FILE="/tmp/claude-code-demo-failures.log"

cat >> "$LOG_FILE" <<EOF
[$(date -Iseconds)] FAILED
  Command : $CMD
  Error   : $(echo "$ERROR" | head -5)
──────────────────────────────────────
EOF

exit 0
