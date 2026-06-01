import { describe, it, expect, beforeEach } from 'vitest';
import { taskService } from '../src/services/taskService.js';

describe('taskService', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('getAll()', () => {
    it('returns seeded tasks', () => {
      const tasks = taskService.getAll();
      expect(tasks.length).toBeGreaterThan(0);
    });

    it('returns tasks sorted newest-first', () => {
      const tasks = taskService.getAll();
      for (let i = 1; i < tasks.length; i++) {
        const prev = new Date(tasks[i - 1].createdAt).getTime();
        const curr = new Date(tasks[i].createdAt).getTime();
        expect(prev).toBeGreaterThanOrEqual(curr);
      }
    });
  });

  describe('getById()', () => {
    it('returns a task by id', () => {
      const [first] = taskService.getAll();
      expect(taskService.getById(first.id)).toEqual(first);
    });

    it('returns undefined for unknown id', () => {
      expect(taskService.getById('not-a-real-id')).toBeUndefined();
    });
  });

  describe('create()', () => {
    it('creates a task with required fields', () => {
      const task = taskService.create({ title: 'New task' });
      expect(task).toMatchObject({
        title: 'New task',
        status: 'todo',
        priority: 'medium',
        tags: [],
      });
      expect(task.id).toBeTruthy();
      expect(task.createdAt).toBeTruthy();
    });

    it('respects optional priority and tags', () => {
      const task = taskService.create({
        title: 'Tagged task',
        priority: 'high',
        tags: ['one', 'two'],
      });
      expect(task.priority).toBe('high');
      expect(task.tags).toEqual(['one', 'two']);
    });

    it('trims whitespace from title', () => {
      const task = taskService.create({ title: '  trimmed  ' });
      expect(task.title).toBe('trimmed');
    });

    it('throws when title is empty', () => {
      expect(() => taskService.create({ title: '' })).toThrow(/required/i);
    });

    it('throws when title is whitespace only', () => {
      expect(() => taskService.create({ title: '   ' })).toThrow(/required/i);
    });

    it('throws when title exceeds 200 characters', () => {
      expect(() => taskService.create({ title: 'x'.repeat(201) })).toThrow(/200/);
    });
  });

  describe('update()', () => {
    it('updates task fields', () => {
      const created = taskService.create({ title: 'Original' });
      const updated = taskService.update(created.id, {
        title: 'Updated',
        status: 'in-progress',
      });
      expect(updated.title).toBe('Updated');
      expect(updated.status).toBe('in-progress');
    });

    it('sets updatedAt to now', () => {
      const before = Date.now();
      const created = taskService.create({ title: 'Timing test' });
      const updated = taskService.update(created.id, { status: 'done' });
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(before);
    });

    it('throws for unknown id', () => {
      expect(() => taskService.update('no-such-id', { status: 'done' })).toThrow(/not found/i);
    });

    it('throws when updating title to empty string', () => {
      const task = taskService.create({ title: 'Valid' });
      expect(() => taskService.update(task.id, { title: '' })).toThrow(/cannot be empty/i);
    });
  });

  describe('delete()', () => {
    it('removes the task', () => {
      const task = taskService.create({ title: 'Delete me' });
      taskService.delete(task.id);
      expect(taskService.getById(task.id)).toBeUndefined();
    });

    it('throws for unknown id', () => {
      expect(() => taskService.delete('no-such-id')).toThrow(/not found/i);
    });
  });

  describe('_reset()', () => {
    it('restores seeded data', () => {
      taskService.create({ title: 'Extra task' });
      const before = taskService.getAll().length;

      taskService._reset();
      const after = taskService.getAll().length;

      // Should be back to the seeded count (5), not before
      expect(after).toBeLessThan(before);
      expect(after).toBe(5);
    });
  });
});
