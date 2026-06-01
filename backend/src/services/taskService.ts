import { randomUUID } from 'crypto';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/index.js';

// In-memory store — swap for a real DB without changing routes
const tasks: Map<string, Task> = new Map();

// Seed with demo data on startup
function seedInitialData(): void {
  const seed: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      title: 'Set up project structure',
      description: 'Initialize monorepo with frontend and backend workspaces',
      status: 'done',
      priority: 'high',
      tags: ['setup', 'architecture'],
    },
    {
      title: 'Write CLAUDE.md',
      description: 'Document AI development patterns and agentic workflows',
      status: 'done',
      priority: 'high',
      tags: ['documentation', 'ai'],
    },
    {
      title: 'Add authentication',
      description: 'Implement JWT-based auth with refresh tokens',
      status: 'in-progress',
      priority: 'medium',
      tags: ['auth', 'security'],
    },
    {
      title: 'Deploy to production',
      description: 'Configure GitHub Actions deploy pipeline',
      status: 'todo',
      priority: 'high',
      tags: ['devops', 'deployment'],
    },
    {
      title: 'Write E2E tests',
      description: 'Add Playwright tests for critical user flows',
      status: 'todo',
      priority: 'low',
      tags: ['testing'],
    },
  ];

  seed.forEach((item) => {
    const now = new Date().toISOString();
    const task: Task = {
      ...item,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    tasks.set(task.id, task);
  });
}

seedInitialData();

export const taskService = {
  getAll(): Task[] {
    return Array.from(tasks.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getById(id: string): Task | undefined {
    return tasks.get(id);
  },

  create(input: CreateTaskInput): Task {
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('Task title is required');
    }
    if (input.title.length > 200) {
      throw new Error('Task title must be 200 characters or fewer');
    }

    const now = new Date().toISOString();
    const task: Task = {
      id: randomUUID(),
      title: input.title.trim(),
      description: input.description?.trim(),
      status: 'todo',
      priority: input.priority ?? 'medium',
      tags: input.tags ?? [],
      createdAt: now,
      updatedAt: now,
    };

    tasks.set(task.id, task);
    return task;
  },

  update(id: string, input: UpdateTaskInput): Task {
    const existing = tasks.get(id);
    if (!existing) {
      throw new Error(`Task ${id} not found`);
    }

    if (input.title !== undefined && input.title.trim().length === 0) {
      throw new Error('Task title cannot be empty');
    }

    const updated: Task = {
      ...existing,
      ...input,
      title: input.title?.trim() ?? existing.title,
      description: input.description?.trim() ?? existing.description,
      updatedAt: new Date().toISOString(),
    };

    tasks.set(id, updated);
    return updated;
  },

  delete(id: string): void {
    if (!tasks.has(id)) {
      throw new Error(`Task ${id} not found`);
    }
    tasks.delete(id);
  },

  // Useful for tests — reset state between test runs
  _reset(): void {
    tasks.clear();
    seedInitialData();
  },
};
