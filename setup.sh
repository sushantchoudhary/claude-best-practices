#!/usr/bin/env bash
# setup.sh — run this after extracting the archive
# Usage: bash setup.sh

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${BLUE}Claude Code Demo — Setup${NC}"
echo "────────────────────────────────────────"

# ── Verify .claude directory ─────────────────────────────────────────────────
echo ""
echo -e "${BLUE}Claude Code configuration (.claude/):${NC}"

if [ -d ".claude" ]; then
  echo -e "  ${GREEN}✓${NC}  .claude/settings.json   (hooks + permissions)"

  for agent in .claude/agents/*.md; do
    [ -f "$agent" ] && echo -e "  ${GREEN}✓${NC}  $agent"
  done

  for skill in .claude/skills/*/SKILL.md; do
    [ -f "$skill" ] && echo -e "  ${GREEN}✓${NC}  $skill"
  done

  for hook in .claude/hooks/*.sh; do
    [ -f "$hook" ] && echo -e "  ${GREEN}✓${NC}  $hook"
  done

  for cmd in .claude/commands/*.md; do
    [ -f "$cmd" ] && echo -e "  ${GREEN}✓${NC}  $cmd"
  done
else
  echo -e "  ${YELLOW}⚠${NC}  .claude/ not found — it may be hidden by your OS."
  echo "     On macOS: press Cmd+Shift+. in Finder to show hidden files."
  echo "     On Windows: enable 'Show hidden items' in File Explorer."
fi

echo ""
echo -e "${BLUE}Other CLAUDE.md files:${NC}"
for f in CLAUDE.md frontend/CLAUDE.md backend/CLAUDE.md; do
  [ -f "$f" ] && echo -e "  ${GREEN}✓${NC}  $f"
done

# ── Install dependencies ──────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}Installing dependencies...${NC}"
npm install

# ── Run tests ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}Running test suite...${NC}"
npm test

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  npm run dev       # start frontend + backend"
echo "  cat CLAUDE.md     # read the AI development guide"
echo ""
echo "Open in Claude Code:"
echo "  claude            # from this directory"
echo "  /add-feature      # try a slash command"
