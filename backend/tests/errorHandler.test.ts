import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/index.js';

const app = createApp();

describe('Error handling middleware', () => {
  describe('notFoundHandler', () => {
    it('returns 404 for unknown routes', async () => {
      const res = await request(app).get('/api/unknown-route');
      expect(res.status).toBe(404);
      expect(res.body.data).toBeNull();
      expect(res.body.error).toMatch(/not found/i);
    });

    it('includes method and path in the error message', async () => {
      const res = await request(app).post('/api/totally-unknown');
      expect(res.status).toBe(404);
      expect(res.body.error).toContain('POST');
      expect(res.body.error).toContain('/api/totally-unknown');
    });

    it('returns 404 for DELETE on unknown route', async () => {
      const res = await request(app).delete('/api/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('errorHandler', () => {
    it('returns error envelope shape on 500', async () => {
      // Trigger a service error (empty title → throws)
      const res = await request(app).post('/api/tasks').send({ title: '' });
      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({ data: null, error: expect.any(String) });
    });

    it('returns JSON content-type on errors', async () => {
      const res = await request(app).get('/api/does-not-exist');
      expect(res.headers['content-type']).toMatch(/json/);
    });
  });

  describe('health check', () => {
    it('GET /health returns 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
    });
  });
});
