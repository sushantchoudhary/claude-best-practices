# Add Endpoint

Add a single API endpoint following the project's patterns. Use the `add-api-endpoint` skill.

## Arguments

`/add-endpoint <METHOD> <path> <description>`

Example: `/add-endpoint PATCH /api/tasks/:id/tags update task tags`

## Workflow

1. Read the skill: `cat .claude/skills/add-api-endpoint/SKILL.md`
2. Follow the skill steps precisely
3. After implementing, run `/ship` to verify everything is correct

## Quick Pattern Reminder

Every endpoint needs exactly these 4 things:

| # | What | Where |
|---|------|-------|
| 1 | Input + return types | `backend/src/types/index.ts` + mirror in `frontend/src/types/index.ts` |
| 2 | Service method with validation | `backend/src/services/*.ts` |
| 3 | Route handler (thin — delegates to service) | `backend/src/routes/*.ts` |
| 4 | Supertest integration test | `backend/tests/*.test.ts` |

After adding, run:
```bash
npm run typecheck --workspace=backend
npm run test --workspace=backend
npm run validate:types
```
