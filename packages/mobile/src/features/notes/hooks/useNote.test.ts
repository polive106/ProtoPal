// @vitest-environment jsdom
vi.mock('../api', () => ({
  notesApi: {
    get: vi.fn(),
  },
}));

import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { notesApi } from '../api';
import { useNote } from './useNote';

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useNote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches a single note by id', async () => {
    const mockNote = { id: '1', title: 'Note 1', content: 'Content 1', userId: 'u1', createdAt: '2024-01-01', updatedAt: '2024-01-01' };
    vi.mocked(notesApi.get).mockResolvedValue(mockNote);

    const { result } = renderHook(() => useNote('1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockNote);
    expect(notesApi.get).toHaveBeenCalledWith('1');
  });

  it('returns error on failure', async () => {
    vi.mocked(notesApi.get).mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useNote('999'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Not found');
  });
});
