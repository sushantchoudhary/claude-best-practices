import type { Task } from '../types/index.js';

export const mockTask = (overrides?: Partial<Task>): Task => ({
  id: 'task-1',
  title: 'Test task',
  description: 'A test task description',
  status: 'todo',
  priority: 'medium',
  tags: ['test'],
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
  ...overrides,
});

export const mockTasks: Task[] = [
  mockTask({ id: 'task-1', title: 'First task', status: 'todo' }),
  mockTask({ id: 'task-2', title: 'Second task', status: 'in-progress', priority: 'high' }),
  mockTask({ id: 'task-3', title: 'Third task', status: 'done', tags: ['done', 'shipped'] }),
];
