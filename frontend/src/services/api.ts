import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  ApiResponse,
} from '../types/index.js';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  const json = (await res.json()) as ApiResponse<T>;

  // Normalise HTTP errors into the envelope
  if (!res.ok) {
    return {
      data: null,
      error: json.error ?? `HTTP ${res.status}: ${res.statusText}`,
    };
  }

  return json;
}

export const api = {
  tasks: {
    list(): Promise<ApiResponse<Task[]>> {
      return request<Task[]>('/api/tasks');
    },

    get(id: string): Promise<ApiResponse<Task>> {
      return request<Task>(`/api/tasks/${id}`);
    },

    create(input: CreateTaskInput): Promise<ApiResponse<Task>> {
      return request<Task>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    update(id: string, input: UpdateTaskInput): Promise<ApiResponse<Task>> {
      return request<Task>(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      });
    },

    delete(id: string): Promise<ApiResponse<null>> {
      return request<null>(`/api/tasks/${id}`, { method: 'DELETE' });
    },
  },
};
