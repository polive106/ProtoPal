// @vitest-environment jsdom
vi.mock('@/lib/secureStorage', () => ({
  secureStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    deleteItem: vi.fn(),
  },
}));

vi.mock('@/lib/api', () => ({
  setToken: vi.fn(),
}));

vi.mock('@/features/auth/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { secureStorage } from '@/lib/secureStorage';
import { setToken } from '@/lib/api';
import { authApi } from '@/features/auth/api';
import { AuthProvider, useAuth } from './AuthProvider';

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

const mockUser = {
  id: 'u1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  status: 'approved',
  roles: [{ roleId: 'r1', roleName: 'user' }],
};

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts in loading state', () => {
    vi.mocked(secureStorage.getItem).mockResolvedValue(null);
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('restores session from SecureStore on mount', async () => {
    vi.mocked(secureStorage.getItem).mockResolvedValue('stored-token');
    vi.mocked(authApi.getCurrentUser).mockResolvedValue({ user: mockUser });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(setToken).toHaveBeenCalledWith('stored-token');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('clears token when session restore fails', async () => {
    vi.mocked(secureStorage.getItem).mockResolvedValue('bad-token');
    vi.mocked(authApi.getCurrentUser).mockRejectedValue(new Error('unauthorized'));

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(secureStorage.deleteItem).toHaveBeenCalledWith('auth_token');
    expect(setToken).toHaveBeenCalledWith(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('finishes loading with no user when no stored token', async () => {
    vi.mocked(secureStorage.getItem).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('login stores token and sets user', async () => {
    vi.mocked(secureStorage.getItem).mockResolvedValue(null);
    vi.mocked(authApi.login).mockResolvedValue({ user: mockUser, token: 'new-token' });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('test@example.com', 'Password1!');
    });

    expect(secureStorage.setItem).toHaveBeenCalledWith('auth_token', 'new-token');
    expect(setToken).toHaveBeenCalledWith('new-token');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('register calls API', async () => {
    vi.mocked(secureStorage.getItem).mockResolvedValue(null);
    vi.mocked(authApi.register).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const data = { email: 'new@example.com', password: 'Password1!', firstName: 'New', lastName: 'User' };
    await act(async () => {
      await result.current.register(data);
    });

    expect(authApi.register).toHaveBeenCalledWith(data);
  });

  it('logout clears token and user', async () => {
    vi.mocked(secureStorage.getItem).mockResolvedValue('stored-token');
    vi.mocked(authApi.getCurrentUser).mockResolvedValue({ user: mockUser });
    vi.mocked(authApi.logout).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    await act(async () => {
      await result.current.logout();
    });

    expect(secureStorage.deleteItem).toHaveBeenCalledWith('auth_token');
    expect(setToken).toHaveBeenCalledWith(null);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    expect(() => renderHook(() => useAuth(), { wrapper })).toThrow(
      'useAuth must be used within an AuthProvider',
    );
  });
});
