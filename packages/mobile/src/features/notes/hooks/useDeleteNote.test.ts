// @vitest-environment jsdom
vi.mock('../api', () => ({
  notesApi: {
    delete: vi.fn(),
  },
}));

vi.mock('@/lib/queryClient', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}));

import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { notesApi } from '../api';
import { useDeleteNote } from './useDeleteNote';

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useDeleteNote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a note', async () => {
    vi.mocked(notesApi.delete).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteNote(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate('1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(notesApi.delete).toHaveBeenCalledWith('1');
  });

  it('returns error on failure', async () => {
    vi.mocked(notesApi.delete).mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useDeleteNote(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate('999');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Not found');
  });
});
