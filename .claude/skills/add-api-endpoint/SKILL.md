# Skill: Add API Endpoint

Use this skill when asked to add a new API endpoint to the backend.

## Step-by-Step Process

### 1. Define the type (if new data shape needed)

Edit `backend/src/types/index.ts` — add input and response types:

```typescript
export interface CreateWidgetInput {
  name: string;
  // add fields here
}

export interface Widget {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```

If you added types, **immediately** mirror them in `frontend/src/types/index.ts` and run:
```bash
npm run validate:types
```

### 2. Add service method

Edit or create `backend/src/services/widgetService.ts`:

```typescript
export const widgetService = {
  create(input: CreateWidgetInput): Widget {
    // validation first — throw descriptive errors
    if (!input.name?.trim()) throw new Error('Widget name is required');
    // business logic
    const now = new Date().toISOString();
    const widget: Widget = { id: randomUUID(), name: input.name.trim(), createdAt: now, updatedAt: now };
    widgets.set(widget.id, widget);
    return widget;
  },
  // ...
};
```

### 3. Add route handler

Edit `backend/src/routes/widgets.ts` (create if new):

```typescript
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { widgetService } from '../services/widgetService.js';
import type { ApiResponse, Widget } from '../types/index.js';

export const widgetRouter = Router();

// POST /api/widgets
widgetRouter.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const widget = widgetService.create(req.body);
    res.status(201).json({ data: widget, error: null } satisfies ApiResponse<Widget>);
  } catch (err) {
    next(err); // always delegate errors
  }
});
```

### 4. Register the router

Edit `backend/src/index.ts`:

```typescript
import { widgetRouter } from './routes/widgets.js';
// ...
app.use('/api/widgets', widgetRouter);
```

### 5. Write tests

Create `backend/tests/widgets.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/index.js';
import { widgetService } from '../src/services/widgetService.js';

const app = createApp();

describe('Widget API', () => {
  beforeEach(() => widgetService._reset());

  it('POST /api/widgets creates a widget', async () => {
    const res = await request(app).post('/api/widgets').send({ name: 'Test Widget' });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ name: 'Test Widget' });
  });

  it('POST /api/widgets returns 500 when name is missing', async () => {
    const res = await request(app).post('/api/widgets').send({});
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/required/i);
  });
});
```

### 6. Verify

```bash
npm run typecheck --workspace=backend
npm run test --workspace=backend
```

Both must pass before considering the work done.
