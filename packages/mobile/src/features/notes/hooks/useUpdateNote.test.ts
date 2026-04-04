// @vitest-environment jsdom
vi.mock('../api', () => ({
  notesApi: {
    update: vi.fn(),
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
import { useUpdateNote } from './useUpdateNote';

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useUpdateNote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates a note', async () => {
    const mockNote = { id: '1', title: 'Updated', content: 'Body', userId: 'u1', createdAt: '2024-01-01', updatedAt: '2024-01-02' };
    vi.mocked(notesApi.update).mockResolvedValue(mockNote);

    const { result } = renderHook(() => useUpdateNote(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: '1', title: 'Updated' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(notesApi.update).toHaveBeenCalledWith('1', { title: 'Updated' });
  });

  it('returns error on failure', async () => {
    vi.mocked(notesApi.update).mockRejectedValue(new Error('Forbidden'));

    const { result } = renderHook(() => useUpdateNote(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: '1', title: 'Updated' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Forbidden');
  });
});
