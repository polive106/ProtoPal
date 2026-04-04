// @vitest-environment jsdom
vi.mock('../api', () => ({
  notesApi: {
    list: vi.fn(),
  },
}));

import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { notesApi } from '../api';
import { useNotes } from './useNotes';

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches notes list', async () => {
    const mockNotes = [
      { id: '1', title: 'Note 1', content: 'Content 1', userId: 'u1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    ];
    vi.mocked(notesApi.list).mockResolvedValue(mockNotes);

    const { result } = renderHook(() => useNotes(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockNotes);
    expect(notesApi.list).toHaveBeenCalledOnce();
  });

  it('returns error on failure', async () => {
    vi.mocked(notesApi.list).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useNotes(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Network error');
  });
});
