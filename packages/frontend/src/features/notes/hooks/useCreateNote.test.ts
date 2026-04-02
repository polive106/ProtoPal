import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateNote } from './useCreateNote';

vi.mock('../api', () => ({
  notesApi: {
    create: vi.fn().mockResolvedValue({ id: '1', title: 'New', content: 'Content', userId: 'u1', createdAt: '', updatedAt: '' }),
  },
}));

vi.mock('@/lib/queryClient', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useCreateNote', () => {
  it('calls notesApi.create and invalidates queries on success', async () => {
    const { notesApi } = await import('../api');
    const { queryClient } = await import('@/lib/queryClient');

    const { result } = renderHook(() => useCreateNote(), { wrapper: createWrapper() });

    result.current.mutate({ title: 'New', content: 'Content' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(notesApi.create).toHaveBeenCalledWith({ title: 'New', content: 'Content' });
    expect(queryClient.invalidateQueries).toHaveBeenCalled();
  });
});
