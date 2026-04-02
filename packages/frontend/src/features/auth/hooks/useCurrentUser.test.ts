import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';

vi.mock('../api', () => ({
  authApi: {
    getCurrentUser: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useCurrentUser', () => {
  it('returns user data on success', async () => {
    const { authApi } = await import('../api');
    const mockUser = { id: '1', email: 'test@test.com', firstName: 'Test', lastName: 'User', status: 'active', roles: [] };
    (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({ user: mockUser });

    const { result } = renderHook(() => useCurrentUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockUser);
  });

  it('returns undefined on 401 error', async () => {
    const { authApi } = await import('../api');
    (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Unauthorized'));

    const { result } = renderHook(() => useCurrentUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
