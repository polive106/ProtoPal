// @vitest-environment jsdom
vi.mock('../api', () => ({
  notesApi: {
    create: vi.fn(),
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
import { useCreateNote } from './useCreateNote';

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useCreateNote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a note and invalidates cache', async () => {
    const mockNote = { id: '1', title: 'New', content: 'Body', userId: 'u1', createdAt: '2024-01-01', updatedAt: '2024-01-01' };
    vi.mocked(notesApi.create).mockResolvedValue(mockNote);

    const { result } = renderHook(() => useCreateNote(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ title: 'New', content: 'Body' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(notesApi.create).toHaveBeenCalledWith({ title: 'New', content: 'Body' });
  });

  it('returns error on failure', async () => {
    vi.mocked(notesApi.create).mockRejectedValue(new Error('Validation failed'));

    const { result } = renderHook(() => useCreateNote(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ title: '', content: '' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Validation failed');
  });
});
