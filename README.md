# Claude Code Demo

> A full-stack TypeScript application demonstrating best practices for AI-assisted development with [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

[![CI](https://github.com/your-org/claude-code-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/claude-code-demo/actions/workflows/ci.yml)

---

## What This Is

This project is a **working reference implementation** for teams adopting Claude Code. It shows:

- How to structure a project so Claude Code works effectively
- The patterns and conventions that make AI assistance most reliable
- Agentic workflow scripts Claude can run autonomously
- A complete CI/CD pipeline with Docker and GitHub Actions

The application itself is a task manager — simple enough to understand instantly, complex enough to demonstrate real patterns.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Express + TypeScript + Node.js |
| Testing | Vitest + React Testing Library + Supertest |
| Linting | ESLint + TypeScript strict mode |
| CI/CD | GitHub Actions |
| Container | Docker (multi-stage) |

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Run locally (no Docker)

```bash
# 1. Clone the repo
git clone https://github.com/your-org/claude-code-demo.git
cd claude-code-demo

# 2. Copy environment variables
cp .env.example .env

# 3. Install all dependencies
npm install

# 4. Start frontend + backend concurrently
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

### Run with Docker Compose

```bash
docker compose up
```

---

## Commands

```bash
npm run dev          # Start frontend + backend in watch mode
npm test             # Run all tests
npm run lint         # Lint all workspaces
npm run typecheck    # Type-check all workspaces
npm run build        # Production build

# Agentic scripts
npm run scaffold:component -- MyComponent   # Create component + test
npm run audit:tests                          # Find untested files
npm run validate:types                       # Check frontend/backend type parity
npm run propose:claude-updates               # Propose repo updates from latest Claude changelog
```

---

## Project Structure

```
claude-code-demo/
├── CLAUDE.md              ← AI development guide (read this!)
├── .github/workflows/
│   ├── ci.yml             ← lint + test + build on every push
│   └── deploy.yml         ← build image + deploy on merge to main
├── frontend/              ← React + Vite + TypeScript
│   └── src/
│       ├── components/    ← UI (dumb, presentational)
│       ├── hooks/         ← stateful logic
│       ├── services/      ← API calls
│       └── types/         ← shared TypeScript types
├── backend/               ← Express + TypeScript
│   └── src/
│       ├── routes/        ← thin HTTP handlers
│       ├── services/      ← business logic
│       ├── middleware/    ← auth, errors, logging
│       └── types/         ← shared TypeScript types
└── scripts/               ← agentic automation
```

---

## Claude Code Integration

This project is designed to work well with Claude Code. The key file is [`CLAUDE.md`](./CLAUDE.md), which tells Claude:

- What the project does and how it's structured
- Coding conventions and patterns to follow
- How to run tests and other commands
- Which tasks Claude can do autonomously vs. what needs human approval

### Example Claude Code prompts

```
# Add a feature
"Add a 'due date' field to tasks. Update the Task type in both workspaces,
the backend service, the TaskCard component, and the AddTaskForm.
Include tests. Run npm test to verify."

# Fix a bug
"The PATCH /api/tasks/:id endpoint is not updating the updatedAt field.
Find the bug, fix it, and add a regression test."

# Refactor
"Extract the task status advancement logic from TaskCard into a
pure utility function in src/utils/taskStatus.ts. Update the component
to use it and add unit tests for the utility."
```

---

## Deployment

The deploy pipeline in `.github/workflows/deploy.yml` triggers on every merge to `main`.

### Setup

1. **Fork/clone** this repo to your GitHub account

2. **Enable GitHub Actions** (it's on by default)

3. **Configure your deployment target** in `deploy.yml`:
   - **SSH/VPS**: uncomment the `Deploy via SSH` step and add secrets `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`
   - **Railway**: uncomment the Railway step and add `RAILWAY_TOKEN`
   - **Render**: uncomment the Render step and add `RENDER_DEPLOY_HOOK_URL`

4. **Set the `APP_URL` variable** in your GitHub repo settings → Environments → production, to enable smoke tests.

### Docker image

Images are pushed to GitHub Container Registry (`ghcr.io`) on every main branch push:

```bash
# Pull the latest image
docker pull ghcr.io/your-org/claude-code-demo:latest

# Run it
docker run -p 3001:3001 -e NODE_ENV=production ghcr.io/your-org/claude-code-demo:latest
```

---

## Testing

```bash
npm test                         # Run all tests once
npm run test:watch               # Watch mode
npm run test:coverage            # With coverage report
```

Coverage thresholds (enforced in CI):
- Backend: 80% lines, 80% functions
- Frontend: 70% lines, 70% functions

---

## Contributing

This project follows a branch-based workflow:

1. Create a branch: `git checkout -b feat/my-feature`
2. Make changes (Claude Code can help!)
3. Run `npm test && npm run typecheck`
4. Open a pull request → CI runs automatically
5. Merge to `main` → deploy pipeline runs

---

## License

MIT
