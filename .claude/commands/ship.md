# Ship

Run the full quality pipeline and create a commit. Use before pushing any branch.

## Arguments

`/ship "<commit message>"` — verify and commit with the given message  
`/ship` — verify only, no commit

## Workflow

Run these checks in order. Stop and fix any failure before continuing.

### 1. Typecheck both workspaces
```bash
npm run typecheck
```
✅ Both workspaces must report zero errors.

### 2. Run all tests
```bash
npm test
```
✅ All 77+ tests must pass.

### 3. Validate type parity
```bash
npm run validate:types
```
✅ All shared types present in both workspaces.

### 4. Audit test coverage
```bash
npm run audit:tests
```
📋 Review — new source files without tests should be intentional.

### 5. Lint check
```bash
npm run lint
```
✅ No linting errors.

### 6. Production build
```bash
npm run build
```
✅ Both workspaces build successfully.

### 7. Run the code reviewer (if changes are substantial)

Spawn **code-reviewer** sub-agent:
> Review `git diff HEAD` — check patterns, test coverage, and security.

Address any CRITICAL issues before committing.

### 8. Commit (if a message was provided)

```bash
git add -A
git status  # review what's being committed
git commit -m "<message>"
```

## Commit Message Format

```
type(scope): short description

# Examples:
feat(tasks): add priority field with low/medium/high values
fix(api): return 404 instead of 500 for unknown task id  
test(taskService): add edge cases for empty title validation
refactor(hooks): extract status advancement logic to utility
docs(CLAUDE.md): add sub-agent workflow examples
```

Types: `feat` | `fix` | `test` | `refactor` | `docs` | `chore` | `ci`

## What NOT to Ship

- `// @ts-ignore` or `as any` casts
- `console.log` in source files (tests are fine)
- TODOs that were supposed to be fixed in this PR
- Failing tests (even in unrelated files)
- TypeScript errors in any workspace
