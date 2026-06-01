import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/taskService.js';
import type { CreateTaskInput, UpdateTaskInput, ApiResponse } from '../types/index.js';
import type { Task } from '../types/index.js';

export const taskRouter = Router();

// GET /api/tasks — list all tasks
taskRouter.get('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = taskService.getAll();
    const response: ApiResponse<Task[]> = {
      data: tasks,
      error: null,
      meta: { total: tasks.length },
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:id — get a single task
taskRouter.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = taskService.getById(req.params.id);
    if (!task) {
      res.status(404).json({ data: null, error: 'Task not found' } satisfies ApiResponse<null>);
      return;
    }
    res.json({ data: task, error: null } satisfies ApiResponse<Task>);
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks — create a task
taskRouter.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = req.body as CreateTaskInput;
    const task = taskService.create(input);
    res.status(201).json({ data: task, error: null } satisfies ApiResponse<Task>);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tasks/:id — update a task
taskRouter.patch('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = req.body as UpdateTaskInput;
    const task = taskService.update(req.params.id, input);
    res.json({ data: task, error: null } satisfies ApiResponse<Task>);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id — remove a task
taskRouter.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    taskService.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
