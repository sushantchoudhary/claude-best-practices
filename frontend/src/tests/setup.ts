import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock the API service globally — tests should mock individual methods
vi.mock('../services/api', () => ({
  api: {
    tasks: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));
