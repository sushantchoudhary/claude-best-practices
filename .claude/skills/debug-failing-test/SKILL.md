# Skill: Debug Failing Test

Use this skill when tests are failing and you need to diagnose and fix them systematically.

## Failure Classification

Before touching any code, identify which of these categories the failure falls into:

| Category | Symptoms | Fix target |
|----------|----------|------------|
| **Source bug** | Test assertion correctly describes expected behaviour, source doesn't do it | Fix the source file |
| **Test bug** | Test assertion is wrong — wrong expected value or overly brittle | Fix the test |
| **Type error** | `Property X does not exist`, `Type A not assignable to B` | Fix types and/or source |
| **Import error** | `Cannot find module`, `is not a function` | Fix import path or export |
| **Mock error** | `mockFn was not called` or called with wrong args | Fix the mock setup or the code being tested |
| **Async error** | `act(...)` warnings, race conditions | Wrap in `await`, use `waitFor` |
| **Environment error** | Works locally, fails in CI | Check Node version, env vars, isolation |

## Diagnostic Steps

### Step 1: Read the full error

```bash
# Run just the failing test with verbose output
npm run test --workspace=frontend -- --reporter=verbose <test-file>
npm run test --workspace=backend -- --reporter=verbose <test-file>
```

Read the FULL error — not just the first line. The stack trace tells you exactly where it failed.

### Step 2: Read the test

Open the test file. Understand what it's asserting and why. Ask:
- What is the test *supposed* to verify?
- What does the error say it *actually* got?
- Is the assertion correct?

### Step 3: Read the source

Open the source file the test is testing. Trace through the code path manually.

### Step 4: Check mocks (frontend tests)

The test setup in `frontend/src/tests/setup.ts` globally mocks `services/api`. If a test calls `api.tasks.list()`, the mock returns `undefined` unless you configure it:

```typescript
// ✅ In your test
import { api } from '../services/api.js';
vi.mocked(api.tasks.list).mockResolvedValueOnce({ data: [], error: null });
```

Common mock mistakes:
- Forgetting to configure the mock → function returns `undefined`
- Using `mockReturnValue` for async functions (use `mockResolvedValue`)
- Not clearing mocks between tests (use `beforeEach(() => vi.clearAllMocks())`)

### Step 5: Check async handling (frontend tests)

React Testing Library requires all state updates to be wrapped in `act()`. The `userEvent` from `@testing-library/user-event` handles this automatically — prefer it over `fireEvent`.

```typescript
// ✅ Correct
const user = userEvent.setup();
await user.click(button);
await waitFor(() => expect(screen.getByText('Done')).toBeInTheDocument());

// ❌ Incorrect — synchronous interactions on async components
fireEvent.click(button);
expect(screen.getByText('Done')).toBeInTheDocument(); // will fail
```

### Step 6: Run typecheck

```bash
npm run typecheck --workspace=frontend
npm run typecheck --workspace=backend
```

Type errors sometimes cause test failures that aren't obvious from the test output.

## Fix Verification

After making a fix:

```bash
# Run the specific test first
npm run test --workspace=<workspace> -- <test-file>

# Then run all tests to check for regressions
npm test
```

Both must be green before the fix is complete.

## Common Patterns in This Project

### Backend: service not reset between tests
```typescript
// Missing this causes tests to share state
beforeEach(() => {
  taskService._reset(); // or yourService._reset()
});
```

### Frontend: component re-renders after async op
```typescript
// Use findBy* instead of getBy* for elements that appear after async ops
const element = await screen.findByText('Loaded');
// Or use waitFor:
await waitFor(() => expect(screen.getByText('Loaded')).toBeInTheDocument());
```

### Frontend: event on non-rendered element
```typescript
// The button may not exist yet — open the form first
await user.click(screen.getByRole('button', { name: /new task/i })); // opens form
await user.click(screen.getByRole('button', { name: /submit/i }));   // now it exists
```
