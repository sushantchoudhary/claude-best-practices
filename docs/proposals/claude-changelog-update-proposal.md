# Claude Code Changelog Update Proposal

Generated: 2026-06-01T04:37:44.279Z
Source: https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md

## Scan Summary

- Releases scanned: 12
- Changelog items scanned: 230
- Relevant items included: 10

## Top Recommendations

### 1. 2.1.149: `/usage` now shows a per-category breakdown of what's driving your limits usage — skills, subagents, plugins, and per-MCP-server cost

- Priority: high
- Why relevant here: This repo relies heavily on local skills and slash commands for demo workflows.
- Recommended repo update: Update docs to include when to use `/reload-skills` and clarify how local `.claude/skills` are auto-discovered.
- Target files: `.claude/settings.json`, `CLAUDE.md`, `.claude/commands/add-feature.md`
- Evidence: Matched themes: agents_workflows, skills_plugins, mcp | Relevance score: 11

### 2. 2.1.145: `/plugin` Discover and Browse screens now show a plugin's commands, agents, skills, hooks, and MCP/LSP servers before installation

- Priority: high
- Why relevant here: This repo relies heavily on local skills and slash commands for demo workflows.
- Recommended repo update: Update docs to include when to use `/reload-skills` and clarify how local `.claude/skills` are auto-discovered.
- Target files: `.claude/settings.json`, `CLAUDE.md`, `.claude/commands/add-feature.md`
- Evidence: Matched themes: skills_plugins, hooks_automation, mcp | Relevance score: 10

### 3. 2.1.154: Fixed subagents in background sessions bypassing the worktree-isolation guard and writing to the shared checkout

- Priority: high
- Why relevant here: This repository demonstrates safe autonomous execution via hooks and permission policies.
- Recommended repo update: Harden `.claude/settings.json` allow/deny examples and document safer command patterns based on recent sandbox/permission fixes.
- Target files: `.claude/settings.json`, `CLAUDE.md`
- Evidence: Matched themes: agents_workflows, safety_permissions | Relevance score: 8

### 4. 2.1.154: Fixed `worktree.baseRef: "head"` resolving to the main checkout's HEAD instead of the current worktree's HEAD when spawning subagents or calling `EnterWorktree` from inside a linked worktree

- Priority: high
- Why relevant here: This repository demonstrates safe autonomous execution via hooks and permission policies.
- Recommended repo update: Harden `.claude/settings.json` allow/deny examples and document safer command patterns based on recent sandbox/permission fixes.
- Target files: `.claude/settings.json`, `CLAUDE.md`
- Evidence: Matched themes: agents_workflows, safety_permissions | Relevance score: 8

### 5. 2.1.153: `claude agents`: autocomplete in the dispatch input now suggests native slash commands and bundled skills, not just project skills

- Priority: high
- Why relevant here: This repo relies heavily on local skills and slash commands for demo workflows.
- Recommended repo update: Update docs to include when to use `/reload-skills` and clarify how local `.claude/skills` are auto-discovered.
- Target files: `.claude/settings.json`, `CLAUDE.md`, `.claude/commands/add-feature.md`
- Evidence: Matched themes: agents_workflows, skills_plugins | Relevance score: 8

### 6. 2.1.153: Fixed background sessions writing temp files to `$CLAUDE_JOB_DIR` triggering a "sensitive file" permission prompt

- Priority: high
- Why relevant here: This repository demonstrates safe autonomous execution via hooks and permission policies.
- Recommended repo update: Harden `.claude/settings.json` allow/deny examples and document safer command patterns based on recent sandbox/permission fixes.
- Target files: `.claude/settings.json`, `CLAUDE.md`
- Evidence: Matched themes: agents_workflows, safety_permissions | Relevance score: 8

### 7. 2.1.152: Fixed a background worker crash in `claude agents` when accepting a stale permission prompt after a subagent was cancelled

- Priority: high
- Why relevant here: This repository demonstrates safe autonomous execution via hooks and permission policies.
- Recommended repo update: Harden `.claude/settings.json` allow/deny examples and document safer command patterns based on recent sandbox/permission fixes.
- Target files: `.claude/settings.json`, `CLAUDE.md`
- Evidence: Matched themes: agents_workflows, safety_permissions | Relevance score: 8

### 8. 2.1.147: Fixed several spacing and layout glitches in the `/plugin`, `/status`, `/mobile`, `/sandbox`, and `/permissions` menus

- Priority: high
- Why relevant here: This repository demonstrates safe autonomous execution via hooks and permission policies.
- Recommended repo update: Harden `.claude/settings.json` allow/deny examples and document safer command patterns based on recent sandbox/permission fixes.
- Target files: `.claude/settings.json`, `CLAUDE.md`
- Evidence: Matched themes: skills_plugins, safety_permissions | Relevance score: 8

### 9. 2.1.157: `tool_decision` telemetry events now include `tool_parameters` (bash commands, MCP/skill names) when `OTEL_LOG_TOOL_DETAILS=1`

- Priority: medium
- Why relevant here: The repo already uses MCP and should keep server approval/config guidance current.
- Recommended repo update: Update MCP guidance with strict config/approval expectations and relevant troubleshooting notes.
- Target files: `.claude/settings.json`, `CLAUDE.md`
- Evidence: Matched themes: skills_plugins, mcp | Relevance score: 7

### 10. 2.1.157: Fixed background sessions re-attached after a sleep/wake not telling the model the correct date

- Priority: medium
- Why relevant here: Stable model defaults and fallback behavior improve repeatability for humans and agents.
- Recommended repo update: Align model guidance with latest Claude defaults and add explicit fallback-model guidance in project docs/config examples.
- Target files: `.claude/settings.json`, `CLAUDE.md`
- Evidence: Matched themes: agents_workflows, model_effort_fallback | Relevance score: 7

## Ignored Change Categories

- Internal-only release notes with no user-facing behavior
- Pure UI/terminal rendering polish that does not change repo workflows
- OS-specific or provider-specific fixes with no actionable project update

## Suggested Next Step

- Apply the high-priority recommendations first, then re-run this tool after each major Claude Code release.
