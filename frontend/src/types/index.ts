// Shared domain types — keep in sync with backend/src/types/index.ts
// Run `npm run validate:types` to check parity

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  tags?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta?: {
    total?: number;
  };
}

// UI-only types
export type ViewFilter = 'all' | TaskStatus;
