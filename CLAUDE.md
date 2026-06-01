# CLAUDE.md — AI Development Guide

> This file is the single source of truth for Claude Code when working in this repository.
> It defines how AI should assist, what patterns to follow, and what agentic workflows are available.

---

## Project Overview

**Claude Code Demo** is a full-stack task management app built to showcase AI-assisted development
patterns using [Claude Code](https://docs.anthropic.com/en/docs/claude-code). It uses:

- **Frontend**: React 18 + TypeScript + Vite + CSS Modules
- **Backend**: Express + TypeScript + Node.js
- **Testing**: Vitest + React Testing Library + Supertest
- **CI/CD**: GitHub Actions → Docker → Cloud deployment
- **Linting**: ESLint + Prettier

---

## Claude Code Configuration

This project is fully configured for Claude Code. All configuration lives in `.claude/`:

```
.claude/
├── settings.json               ← hooks, permissions, model config
├── agents/                     ← sub-agent definitions
│   ├── code-reviewer.md        ← security & quality review (read-only)
│   ├── test-runner.md          ← diagnoses failures, never modifies source
│   ├── frontend-specialist.md  ← React/TS expert, frontend/ only
│   ├── backend-specialist.md   ← Express/API expert, backend/ only
│   └── doc-writer.md           ← keeps docs in sync with code
├── skills/                     ← step-by-step reusable instructions
│   ├── add-api-endpoint/SKILL.md
│   ├── add-react-component/SKILL.md
│   └── debug-failing-test/SKILL.md
├── hooks/                      ← lifecycle scripts (auto-run)
│   ├── pre-bash-guard.sh       ← blocks rm -rf, force push, etc.
│   ├── post-edit-typecheck.sh  ← auto type-checks .ts/.tsx edits
│   ├── post-edit-lint.sh       ← auto lints .ts/.tsx edits
│   └── log-failure.sh          ← logs failed bash commands
└── commands/                   ← slash commands (/name)
    ├── add-feature.md          ← /add-feature
    ├── add-endpoint.md         ← /add-endpoint
    ├── fix-tests.md            ← /fix-tests
    ├── review.md               ← /review
    └── ship.md                 ← /ship
```

Also see `frontend/CLAUDE.md` and `backend/CLAUDE.md` for directory-specific instructions.

### Hooks (run automatically)

| Hook | Trigger | Effect |
|------|---------|--------|
| `pre-bash-guard` | Before `Bash` | Blocks `rm -rf`, force push, `reset --hard` |
| `post-edit-typecheck` | After `.ts`/`.tsx` edit | Runs `tsc --noEmit`, feeds errors back to Claude |
| `post-edit-lint` | After `.ts`/`.tsx` edit | Runs `eslint --fix`, reports unfixable errors |
| `log-failure` | After `Bash` failure | Appends to `/tmp/claude-code-demo-failures.log` |
| Stop quality gate | Before Claude stops | LLM prompt verifies all tasks are actually complete |

### Sub-Agents

Sub-agents have their own context window and scoped tool permissions.

| Agent | Invoke when | Modifies files? |
|-------|------------|----------------|
| `code-reviewer` | Reviewing a PR or diff | No |
| `test-runner` | Tests are failing | No |
| `frontend-specialist` | Complex React/TypeScript work | Yes (frontend/ only) |
| `backend-specialist` | API design and service logic | Yes (backend/ only) |
| `doc-writer` | Syncing docs after changes | Docs only |

Invoke: *"Use the test-runner agent to diagnose the failing tests."*

### Skills

Claude Code reads the relevant skill before starting complex tasks.

| Skill | When it's used |
|-------|---------------|
| `add-api-endpoint` | Adding a new backend endpoint |
| `add-react-component` | Adding a new component or hook |
| `debug-failing-test` | Tests are failing and cause isn't obvious |

### Slash Commands

| Command | What it does |
|---------|-------------|
| `/add-feature <description>` | Full-stack feature with parallel sub-agents |
| `/add-endpoint <METHOD> <path>` | Single API endpoint following the skill |
| `/fix-tests` | Diagnose and fix all failing tests |
| `/review` | Code review via code-reviewer agent |
| `/ship "<commit message>"` | Full quality gate + git commit |

---

## Essential Commands

```bash
# Install everything
npm install

# Run full stack locally
npm run dev

# Run tests (all workspaces)
npm test

# Run linting
npm run lint

# Build for production
npm run build

# Type-check all workspaces
npm run typecheck

# Run a specific workspace
npm run dev --workspace=frontend
npm run dev --workspace=backend
```

---

## Project Architecture

```
claude-code-demo/
├── CLAUDE.md                  ← YOU ARE HERE
├── README.md
├── package.json               ← npm workspaces root
├── docker-compose.yml         ← local full-stack
├── .github/workflows/         ← CI/CD pipelines
│   ├── ci.yml                 ← lint + test + build
│   └── deploy.yml             ← push to registry + deploy
├── frontend/                  ← Vite + React + TS
│   ├── src/
│   │   ├── components/        ← UI components (dumb)
│   │   ├── hooks/             ← custom React hooks (stateful logic)
│   │   ├── services/          ← API calls (side effects)
│   │   ├── types/             ← shared TypeScript interfaces
│   │   └── App.tsx
│   └── tests/
├── backend/                   ← Express + TS
│   ├── src/
│   │   ├── routes/            ← HTTP route handlers (thin)
│   │   ├── services/          ← business logic
│   │   ├── middleware/        ← auth, error handling, logging
│   │   └── types/             ← shared TypeScript interfaces
│   └── tests/
└── scripts/                   ← agentic automation scripts
```

---

## Code Conventions

### TypeScript
- **Strict mode** is enabled everywhere — no `any`, no `as unknown as X`
- Export named types from `types/index.ts` in each workspace
- Prefer `interface` for objects, `type` for unions and utility types
- All async functions must handle errors explicitly

### React Components
- **Functional components only**, hooks for all state/effects
- File naming: `PascalCase.tsx` for components, `camelCase.ts` for utilities
- One component per file; co-locate tests in `tests/` directory
- Props interfaces are always named `ComponentNameProps`

```typescript
// ✅ Good
interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
}

export function TaskCard({ task, onComplete }: TaskCardProps) { ... }

// ❌ Bad — default export, no typed props
export default ({ task, onComplete }: any) => { ... }
```

### API Layer
- All HTTP calls live in `frontend/src/services/api.ts`
- Backend routes are thin — logic belongs in services
- Every route returns `{ data, error }` shape for consistency

```typescript
// ✅ Backend route pattern
router.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await taskService.getAll();
    res.json({ data: tasks, error: null });
  } catch (err) {
    next(err); // always delegate to error middleware
  }
});
```

### Error Handling
- Backend: always `next(err)` from routes, central error middleware handles responses
- Frontend: use the `useAsync` hook for data fetching with built-in error/loading states
- Never swallow errors silently

---

## Testing Patterns

Run tests with `npm test` from the root.

### Frontend (Vitest + React Testing Library)
- Test **behaviour**, not implementation details
- Mock the service layer (`services/api.ts`), not fetch
- Keep tests small and focused — one concept per test

```typescript
// ✅ Test what the user sees
it('shows error message when task creation fails', async () => {
  vi.mocked(api.createTask).mockRejectedValueOnce(new Error('Network error'));
  render(<AddTaskForm onAdd={vi.fn()} />);
  await userEvent.click(screen.getByRole('button', { name: /add task/i }));
  expect(screen.getByText(/network error/i)).toBeInTheDocument();
});
```

### Backend (Vitest + Supertest)
- Integration tests via `supertest` against the full Express app
- Mock the database/service layer, not HTTP

```typescript
// ✅ Backend test pattern
it('POST /tasks returns 201 with created task', async () => {
  const res = await request(app).post('/api/tasks').send({ title: 'Test task' });
  expect(res.status).toBe(201);
  expect(res.body.data).toMatchObject({ title: 'Test task' });
});
```

---

## Agentic Workflow Patterns

### Slash Commands (type in Claude Code)

```
/add-feature priority field on tasks
/add-endpoint PATCH /api/tasks/:id/tags update task tags
/fix-tests
/review
/ship "feat(tasks): add priority field"
```

### Sub-Agent Parallel Feature Pattern

The most powerful workflow — spawn two specialists at once:

```
"Add a due date field to tasks. Use the frontend-specialist and
 backend-specialist agents in parallel. Types first, then both
 agents, then run npm test."
```

### Available Scripts (agentic automation)

| Script | Purpose | Run With |
|--------|---------|----------|
| `scripts/scaffold-component.ts` | Create a typed component + test | `npm run scaffold:component -- TaskList` |
| `scripts/seed-db.ts` | Populate dev database | `npm run db:seed` |
| `scripts/validate-types.ts` | Check frontend/backend type parity | `npm run validate:types` |
| `scripts/audit-tests.ts` | Find untested files | `npm run audit:tests` |
| `scripts/propose-claude-changelog-updates.ts` | Generate prioritized Claude changelog update proposals for this repo | `npm run propose:claude-updates` |

### Claude Code Agent Prompts

Use these prompts when working with Claude Code on this project:

```
# Add a new feature end-to-end
"Add a [feature name] feature. Follow the existing patterns in routes/tasks.ts 
and TaskCard.tsx. Include tests. Run npm test before finishing."

# Fix a failing test
"The test [test name] is failing. Diagnose the issue, fix it, and verify 
all other tests still pass."

# Refactor a component
"Refactor [ComponentName] to use the useAsync hook. Keep the same external API.
Update tests if needed."

# Add an API endpoint
"Add a PATCH /api/tasks/:id endpoint for updating task status. Follow the 
pattern in routes/tasks.ts. Add Supertest coverage."
```

### What Claude Code Can Do Autonomously
- Create new components following the existing pattern
- Write and run tests
- Fix TypeScript errors
- Add new API endpoints
- Update types when the data model changes
- Run the full test suite and fix failures

### What Requires Human Approval
- Changing authentication logic
- Modifying database schema
- Updating CI/CD pipeline configuration
- Changing environment variables or secrets
- Deploying to production

---

## Environment Variables

Copy `.env.example` to `.env` and fill in values before running locally.

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No (default: 3001) | Backend server port |
| `VITE_API_URL` | No (default: http://localhost:3001) | Frontend API base URL |
| `NODE_ENV` | No (default: development) | `development` \| `test` \| `production` |

---

## CI/CD Pipeline

### On every push to any branch
1. **Lint** — ESLint on frontend + backend
2. **Type-check** — `tsc --noEmit` on both workspaces  
3. **Test** — Vitest on frontend + backend
4. **Build** — Vite build + `tsc` compile

### On merge to `main`
5. **Docker build** — Multi-stage image
6. **Push to registry** — GitHub Container Registry (ghcr.io)
7. **Deploy** — Rolling deploy to configured target

---

## Common Claude Code Workflows

### Starting a new feature
```bash
# 1. Create a branch
git checkout -b feat/my-feature

# 2. Describe what you want to Claude Code:
# "Add a priority field to tasks. Update the Task type, the backend 
#  endpoint, the TaskCard component, and all related tests."

# 3. Review changes, run tests
npm test
npm run typecheck

# 4. Push and open a PR
git push origin feat/my-feature
```

### Debugging a production issue
```bash
# Tell Claude Code:
# "The POST /api/tasks endpoint is returning 500. Check the error logs,
#  trace through the code, identify the root cause, and propose a fix."
```

### Code review assistance
```bash
# Tell Claude Code:
# "Review the changes in this PR for: 1) TypeScript correctness, 
#  2) test coverage, 3) adherence to our patterns in CLAUDE.md"
```
