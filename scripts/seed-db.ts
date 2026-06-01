#!/usr/bin/env tsx
/**
 * seed-db.ts
 *
 * Agentic script: hit the running backend API to seed it with realistic demo data.
 * Usage: npm run db:seed
 *
 * Requires the backend to be running (`npm run dev --workspace=backend`).
 * The backend's in-memory store already seeds on startup; this script lets
 * you add extra tasks from the CLI for manual testing or demos.
 */

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

interface TaskPayload {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

const DEMO_TASKS: TaskPayload[] = [
  {
    title: 'Implement JWT authentication',
    description: 'Add refresh tokens, blacklisting on logout, and rate limiting on /auth endpoints.',
    priority: 'high',
    tags: ['auth', 'security', 'backend'],
  },
  {
    title: 'Add Playwright E2E tests',
    description: 'Cover the create → advance → delete task flow. Run in CI against the built app.',
    priority: 'medium',
    tags: ['testing', 'e2e', 'ci'],
  },
  {
    title: 'Set up error monitoring',
    description: 'Integrate Sentry for both frontend and backend. Wire source maps for the build.',
    priority: 'low',
    tags: ['observability', 'devops'],
  },
  {
    title: 'Write API documentation',
    description: 'Generate OpenAPI 3.0 spec from route definitions. Serve Swagger UI at /docs.',
    priority: 'low',
    tags: ['documentation', 'api'],
  },
  {
    title: 'Optimise bundle size',
    description: 'Run vite build --report, identify heavy deps, add code splitting for routes.',
    priority: 'medium',
    tags: ['performance', 'frontend'],
  },
];

async function seed() {
  console.log(`\n🌱  Seeding ${API_URL}/api/tasks with ${DEMO_TASKS.length} tasks…\n`);

  // Health check first
  try {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`Health check failed: ${health.status}`);
  } catch {
    console.error(`❌  Cannot reach backend at ${API_URL}`);
    console.error(`    Make sure it's running: npm run dev --workspace=backend\n`);
    process.exit(1);
  }

  let created = 0;
  let failed = 0;

  for (const task of DEMO_TASKS) {
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });

      const json = (await res.json()) as { data: { id: string; title: string } | null; error: string | null };

      if (!res.ok || json.error) {
        console.error(`  ✗  ${task.title} — ${json.error ?? res.statusText}`);
        failed++;
      } else {
        console.log(`  ✓  ${json.data!.title} [${json.data!.id.slice(0, 8)}]`);
        created++;
      }
    } catch (err) {
      console.error(`  ✗  ${task.title} — ${String(err)}`);
      failed++;
    }
  }

  console.log(`\n  Created: ${created}  Failed: ${failed}\n`);

  if (failed > 0) process.exit(1);
}

void seed();
