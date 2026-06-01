import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/index.js';
import { taskService } from '../src/services/taskService.js';

const app = createApp();

describe('GET /health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });
});

describe('Task API', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('GET /api/tasks', () => {
    it('returns all tasks with meta', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta).toHaveProperty('total');
      expect(res.body.error).toBeNull();
    });

    it('returns tasks sorted by creation date (newest first)', async () => {
      const res = await request(app).get('/api/tasks');
      const dates = (res.body.data as { createdAt: string }[]).map(
        (t) => new Date(t.createdAt).getTime()
      );
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
      }
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('returns a task by id', async () => {
      const all = await request(app).get('/api/tasks');
      const id = (all.body.data as { id: string }[])[0].id;

      const res = await request(app).get(`/api/tasks/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(id);
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app).get('/api/tasks/nonexistent-id');
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/not found/i);
    });
  });

  describe('POST /api/tasks', () => {
    it('creates a task with required fields', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'New test task' });

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        title: 'New test task',
        status: 'todo',
        priority: 'medium',
        tags: [],
      });
      expect(res.body.data.id).toBeDefined();
    });

    it('creates a task with all optional fields', async () => {
      const res = await request(app).post('/api/tasks').send({
        title: 'Full task',
        description: 'With description',
        priority: 'high',
        tags: ['api', 'test'],
      });

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        title: 'Full task',
        description: 'With description',
        priority: 'high',
        tags: ['api', 'test'],
      });
    });

    it('returns 500 when title is missing', async () => {
      const res = await request(app).post('/api/tasks').send({});
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/required/i);
    });

    it('trims whitespace from title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: '  trimmed  ' });
      expect(res.body.data.title).toBe('trimmed');
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('updates task status', async () => {
      const created = await request(app)
        .post('/api/tasks')
        .send({ title: 'Patch me' });
      const id = created.body.data.id;

      const res = await request(app)
        .patch(`/api/tasks/${id}`)
        .send({ status: 'in-progress' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('in-progress');
    });

    it('returns 500 for unknown id', async () => {
      const res = await request(app)
        .patch('/api/tasks/unknown')
        .send({ status: 'done' });
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/not found/i);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('deletes a task and returns 204', async () => {
      const created = await request(app)
        .post('/api/tasks')
        .send({ title: 'Delete me' });
      const id = created.body.data.id;

      const deleteRes = await request(app).delete(`/api/tasks/${id}`);
      expect(deleteRes.status).toBe(204);

      const getRes = await request(app).get(`/api/tasks/${id}`);
      expect(getRes.status).toBe(404);
    });

    it('returns 500 for unknown id', async () => {
      const res = await request(app).delete('/api/tasks/unknown');
      expect(res.status).toBe(500);
    });
  });

  describe('Unknown routes', () => {
    it('returns 404 for unknown route', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
