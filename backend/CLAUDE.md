# Backend CLAUDE.md

> Claude Code reads this file when working in the `backend/` directory.
> It supplements the root `CLAUDE.md` with backend-specific patterns.

## Stack

- **Express 4** with TypeScript strict mode
- **Vitest** + **Supertest** for integration tests
- **helmet**, **cors**, **morgan** pre-configured
- **In-memory store** (`Map<string, T>`) — swap with a DB adapter without changing routes

## Directory Roles (strict separation)

| Directory | What goes here | What does NOT go here |
|-----------|---------------|----------------------|
| `src/routes/` | Thin HTTP handlers — parse request, call service, return response | Business logic, validation |
| `src/services/` | All business logic and validation | HTTP concerns (`req`, `res`) |
| `src/middleware/` | Cross-cutting concerns — auth, errors, logging | Route-specific logic |
| `src/types/index.ts` | All domain types shared with frontend | Implementation details |
| `tests/` | Supertest integration tests | Source code |

## The Single Most Important Rule

**Routes are thin. Services are thick.**

```typescript
// ✅ Correct: route is a thin adapter
router.post('/', (req, res, next) => {
  try {
    const result = taskService.create(req.body);   // ALL logic is here
    res.status(201).json({ data: result, error: null });
  } catch (err) {
    next(err);  // NEVER handle errors in the route
  }
});

// ✅ Correct: service has the logic and validation
export const taskService = {
  create(input: CreateTaskInput): Task {
    if (!input.title?.trim()) throw new Error('Title is required');
    if (input.title.length > 200) throw new Error('Title must be ≤200 chars');
    // business logic here
  }
};
```

## Error Handling Contract

The central error handler in `src/middleware/errorHandler.ts` handles all errors. **Every route MUST use `next(err)`** — never `res.status(500).json(...)` directly.

```typescript
// ✅ Always delegate
} catch (err) {
  next(err);
}

// ❌ Never handle in route
} catch (err) {
  res.status(500).json({ error: 'Something went wrong' }); // WRONG
}
```

## Response Envelope

Every route returns `ApiResponse<T>`:

```typescript
// Success
res.json({ data: task, error: null } satisfies ApiResponse<Task>);

// Not found (explicit 404 — not thrown to error handler)
res.status(404).json({ data: null, error: 'Task not found' } satisfies ApiResponse<null>);
```

## Type Synchronisation

`backend/src/types/index.ts` and `frontend/src/types/index.ts` must stay in sync.

**When you add or change a type:**
1. Edit `backend/src/types/index.ts`
2. Mirror the change in `frontend/src/types/index.ts`
3. Run: `npm run validate:types` from the repo root

## Testing Pattern

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/index.js';
import { taskService } from '../src/services/taskService.js';

const app = createApp();

describe('Resource API', () => {
  // ⚠️ Always reset state — tests must be independent
  beforeEach(() => taskService._reset());

  it('GET /api/resource returns list', async () => {
    const res = await request(app).get('/api/resource');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.error).toBeNull();          // always check error is null on success
    expect(res.body.meta?.total).toBeDefined(); // check meta on list endpoints
  });
});
```

Every new service method needs a unit test in `tests/serviceNameService.test.ts`.  
Every new route needs an integration test in `tests/routeName.test.ts`.

## Commands

```bash
npm run dev --workspace=backend       # start dev server on :3001 (hot reload)
npm run test --workspace=backend      # run tests once
npm run test:watch --workspace=backend  # watch mode
npm run typecheck --workspace=backend   # type-check only
npm run build --workspace=backend     # compile to dist/
```
