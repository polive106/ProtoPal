import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLogin } from './useLogin';

vi.mock('../api', () => ({
  authApi: {
    login: vi.fn().mockResolvedValue({ user: { id: '1', email: 'test@test.com' } }),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useLogin', () => {
  it('calls authApi.login with credentials', async () => {
    const { authApi } = await import('../api');

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({ email: 'test@test.com', password: 'password123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authApi.login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password123' });
  });
});
