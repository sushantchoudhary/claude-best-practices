import { useState, useCallback } from 'react';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  error: string | null;
  status: AsyncStatus;
  isLoading: boolean;
  isError: boolean;
}

export function useAsync<T>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    status: 'idle',
    isLoading: false,
    isError: false,
  });

  const run = useCallback(async (promise: Promise<T>): Promise<T | null> => {
    setState((s) => ({ ...s, status: 'loading', isLoading: true, isError: false, error: null }));
    try {
      const data = await promise;
      setState({ data, error: null, status: 'success', isLoading: false, isError: false });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setState({ data: null, error: message, status: 'error', isLoading: false, isError: true });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, error: null, status: 'idle', isLoading: false, isError: false });
  }, []);

  return { ...state, run, reset };
}
