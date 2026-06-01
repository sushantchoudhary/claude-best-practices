import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAsync } from '../hooks/useAsync.js';

describe('useAsync', () => {
  it('starts in idle state', () => {
    const { result } = renderHook(() => useAsync<string>());
    expect(result.current.status).toBe('idle');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('transitions through loading → success', async () => {
    const { result } = renderHook(() => useAsync<string>());

    await act(async () => {
      result.current.run(Promise.resolve('hello'));
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data).toBe('hello');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('transitions through loading → error on rejection', async () => {
    const { result } = renderHook(() => useAsync<string>());

    await act(async () => {
      result.current.run(Promise.reject(new Error('boom')));
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('boom');
    expect(result.current.isError).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it('uses fallback message for non-Error rejections', async () => {
    const { result } = renderHook(() => useAsync<string>());

    await act(async () => {
      result.current.run(Promise.reject('string error'));
    });

    expect(result.current.error).toBe('Something went wrong');
  });

  it('resets to idle state', async () => {
    const { result } = renderHook(() => useAsync<string>());

    await act(async () => {
      result.current.run(Promise.resolve('data'));
    });
    expect(result.current.status).toBe('success');

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBeNull();
  });

  it('returns the resolved value from run()', async () => {
    const { result } = renderHook(() => useAsync<number>());
    let returnValue: number | null = null;

    await act(async () => {
      returnValue = await result.current.run(Promise.resolve(42));
    });

    expect(returnValue).toBe(42);
  });

  it('returns null from run() on error', async () => {
    // suppress console.error in this test
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useAsync<number>());
    let returnValue: number | null = 99;

    await act(async () => {
      returnValue = await result.current.run(Promise.reject(new Error('fail')));
    });

    expect(returnValue).toBeNull();
  });
});
