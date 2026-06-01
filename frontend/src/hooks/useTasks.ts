import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/index.js';

export interface UseTasksResult {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  createTask: (input: CreateTaskInput) => Promise<boolean>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const res = await api.tasks.list();
    if (res.error) {
      setError(res.error);
    } else {
      setTasks(res.data ?? []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (input: CreateTaskInput): Promise<boolean> => {
    const res = await api.tasks.create(input);
    if (res.error || !res.data) {
      setError(res.error ?? 'Failed to create task');
      return false;
    }
    // Optimistic prepend
    setTasks((prev) => [res.data!, ...prev]);
    return true;
  }, []);

  const updateTask = useCallback(
    async (id: string, input: UpdateTaskInput): Promise<boolean> => {
      const res = await api.tasks.update(id, input);
      if (res.error || !res.data) {
        setError(res.error ?? 'Failed to update task');
        return false;
      }
      setTasks((prev) => prev.map((t) => (t.id === id ? res.data! : t)));
      return true;
    },
    []
  );

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    const res = await api.tasks.delete(id);
    if (res.error) {
      setError(res.error);
      return false;
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
    return true;
  }, []);

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refresh: fetchTasks,
  };
}
