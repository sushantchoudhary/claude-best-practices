import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../services/api.js';
import { mockTask, mockTasks } from './fixtures.js';

// Override the mock from setup.ts for this file — we want to test the real api module
vi.unmock('../services/api');

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockResponse<T>(body: T, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

describe('api.tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list()', () => {
    it('GET /api/tasks and returns data', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ data: mockTasks, error: null, meta: { total: 3 } })
      );

      const result = await api.tasks.list();
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/tasks',
        expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) })
      );
      expect(result.data).toEqual(mockTasks);
      expect(result.error).toBeNull();
    });
  });

  describe('get()', () => {
    it('GET /api/tasks/:id', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ data: mockTask(), error: null }));
      const result = await api.tasks.get('task-1');
      expect(mockFetch).toHaveBeenCalledWith('/api/tasks/task-1', expect.any(Object));
      expect(result.data?.id).toBe('task-1');
    });
  });

  describe('create()', () => {
    it('POST /api/tasks with body', async () => {
      const created = mockTask({ id: 'new-1', title: 'Created' });
      mockFetch.mockResolvedValueOnce(mockResponse({ data: created, error: null }));

      const result = await api.tasks.create({ title: 'Created' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/tasks',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ title: 'Created' }),
        })
      );
      expect(result.data?.title).toBe('Created');
    });
  });

  describe('update()', () => {
    it('PATCH /api/tasks/:id with body', async () => {
      const updated = mockTask({ status: 'done' });
      mockFetch.mockResolvedValueOnce(mockResponse({ data: updated, error: null }));

      const result = await api.tasks.update('task-1', { status: 'done' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/tasks/task-1',
        expect.objectContaining({ method: 'PATCH' })
      );
      expect(result.data?.status).toBe('done');
    });
  });

  describe('delete()', () => {
    it('DELETE /api/tasks/:id', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ data: null, error: null }, 204));

      await api.tasks.delete('task-1');
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/tasks/task-1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('error handling', () => {
    it('normalises HTTP error responses into the envelope', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ data: null, error: 'Not found' }, 404)
      );

      const result = await api.tasks.get('bad-id');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Not found');
    });

    it('falls back to HTTP status text when error field is absent', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ data: null, error: null }, 500)
      );

      const result = await api.tasks.get('bad-id');
      expect(result.error).toMatch(/500|error/i);
    });
  });
});
