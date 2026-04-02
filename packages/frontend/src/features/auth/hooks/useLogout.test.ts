import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLogout } from './useLogout';

vi.mock('../api', () => ({
  authApi: {
    logout: vi.fn().mockResolvedValue(undefined),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useLogout', () => {
  it('calls authApi.logout', async () => {
    const { authApi } = await import('../api');

    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authApi.logout).toHaveBeenCalled();
  });
});
