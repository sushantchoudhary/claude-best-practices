# Fix Tests

Diagnose and fix all failing tests systematically.

## Arguments

`/fix-tests` — fix all failing tests  
`/fix-tests <test file or test name>` — fix a specific test

## Workflow

### Step 1: Triage

Run the full suite and collect the failure list:

```bash
npm test 2>&1 | grep -E "(FAIL|✗|×)" | head -20
```

### Step 2: Diagnose with test-runner agent

Spawn the **test-runner** sub-agent with the failing test list:

> Run `npm test` and diagnose all failures. For each failure, identify whether it's a source bug, test bug, type error, mock error, or async error. Provide the exact fix for each failure. Do not modify any files.

### Step 3: Apply fixes

For each failure diagnosed:
1. Read the `debug-failing-test` skill (`cat .claude/skills/debug-failing-test/SKILL.md`)
2. Apply the minimal fix — don't refactor unrelated code
3. Re-run just that test to confirm it's fixed
4. Run `npm run typecheck` if types were changed

### Step 4: Regression check

After all fixes:

```bash
npm test        # all must pass
npm run build   # build must still succeed
```

### Step 5: Commit-ready check

```bash
git diff --stat  # review what changed
npm run lint     # no linting errors
```

## Constraints

- Fix the bug, not the test (unless the test assertion is genuinely wrong)
- Never delete tests to make the suite pass
- Never use `// @ts-ignore` or cast to `any` to silence errors
- If a fix requires changing types, run `npm run validate:types` after
