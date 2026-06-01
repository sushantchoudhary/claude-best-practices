# Add Feature

Implement a full-stack feature end-to-end using parallel sub-agents.

## Arguments

`/add-feature <feature description>`

Example: `/add-feature due date field on tasks`

## Workflow

When this command is invoked, follow this exact process:

### Phase 1: Plan (do this yourself, no sub-agents yet)

1. Read `CLAUDE.md` to understand the project patterns
2. Identify every file that needs to change:
   - Types (`backend/src/types/index.ts` + `frontend/src/types/index.ts`)
   - Backend: service + route + test
   - Frontend: component(s) + hook (if needed) + test(s)
3. Write out the plan as a numbered list before touching any files

### Phase 2: Types first

Update types in BOTH workspaces simultaneously. Types are the contract between frontend and backend — get them right before anything else.

Run `npm run validate:types` to confirm parity.

### Phase 3: Parallel implementation

Spawn two sub-agents to work in parallel:

**Sub-agent 1 — backend-specialist:**
> Implement the backend changes for [feature]. The types have already been updated. Follow the patterns in backend/CLAUDE.md. Do not touch frontend files. Run `npm test --workspace=backend` before finishing.

**Sub-agent 2 — frontend-specialist:**
> Implement the frontend changes for [feature]. The types have already been updated. Follow the patterns in frontend/CLAUDE.md. Do not touch backend files. Run `npm test --workspace=frontend` before finishing.

### Phase 4: Integration check

After both sub-agents finish:

```bash
npm test           # all 77+ tests must pass
npm run typecheck  # both workspaces must compile
npm run build      # production build must succeed
```

### Phase 5: Review

Spawn the **code-reviewer** sub-agent:
> Review the changes just made for the [feature] feature. Check CLAUDE.md patterns, test coverage, error handling, and type safety.

Address any CRITICAL or WARNING issues the reviewer finds.

## What Good Looks Like

A well-implemented feature has:
- ✅ Types updated in both workspaces
- ✅ Backend: service method + route handler + Supertest tests
- ✅ Frontend: component(s) or hook changes + React Testing Library tests  
- ✅ All existing tests still pass
- ✅ No TypeScript errors in either workspace
- ✅ `npm run validate:types` passes
