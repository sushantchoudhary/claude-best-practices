# Review

Run a thorough code review using the code-reviewer sub-agent.

## Arguments

`/review` — review uncommitted changes  
`/review <branch>` — review changes on a specific branch vs main  
`/review <file>` — review a specific file

## Workflow

### Step 1: Prepare context

```bash
# Uncommitted changes
git diff HEAD

# Branch vs main
git diff main..<branch>

# Specific file
git show HEAD -- <file>
```

### Step 2: Run the review agent

Spawn the **code-reviewer** sub-agent:

> Review the changes shown by `git diff HEAD` (or the specified scope). Check for:
> 1. TypeScript correctness (strict mode, no unsafe casts)
> 2. Pattern adherence per CLAUDE.md (thin routes, logic in services, { data, error } envelope)
> 3. Test coverage (every changed source file should have tests)
> 4. Error handling (all async paths handle errors, routes use next(err))
> 5. Security (no secrets, no dangerous operations)
> Output the structured review report.

### Step 3: Address issues

For every CRITICAL issue: fix before merging.  
For every WARNING: fix unless there's a documented reason not to.  
For every SUGGESTION: use judgment.

### Step 4: Re-review (if significant changes made)

If you fixed more than 3 issues, run `/review` again on the new diff.

## What the Reviewer Checks

| Check | Pass condition |
|-------|---------------|
| TypeScript | `npm run typecheck` clean in both workspaces |
| Tests | Changed source files have coverage |
| Patterns | Routes thin, errors delegated, types exported |
| API shape | All routes return `{ data, error }` |
| Type parity | `npm run validate:types` passes |
| Security | No hardcoded secrets, no `eval()` |
