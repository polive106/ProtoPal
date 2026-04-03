// @vitest-environment jsdom
vi.mock('expo-router', () => ({
  useRouter: vi.fn(),
}));

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));

vi.mock('@/providers/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
      this.name = 'ApiError';
    }
  },
  setToken: vi.fn(),
}));

import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { ApiError } from '@/lib/api';
import { useLoginForm } from './useLoginForm';

describe('useLoginForm', () => {
  const mockLogin = vi.fn();
  const mockReplace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ replace: mockReplace } as any);
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('initializes with empty form and no errors', () => {
    const { result } = renderHook(() => useLoginForm());

    expect(result.current.serverError).toBeNull();
    expect(result.current.isPending).toBe(false);
  });

  it('calls login and navigates on success', async () => {
    mockLogin.mockResolvedValue(undefined);
    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      result.current.form.setFieldValue('email', 'test@example.com');
      result.current.form.setFieldValue('password', 'Password1!');
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password1!');
    expect(mockReplace).toHaveBeenCalledWith('/(authenticated)/dashboard');
  });

  it('sets server error on ApiError', async () => {
    mockLogin.mockRejectedValue(new ApiError(401, 'Invalid credentials'));
    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      result.current.form.setFieldValue('email', 'test@example.com');
      result.current.form.setFieldValue('password', 'wrong');
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    expect(result.current.serverError).toBe('Invalid credentials');
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('sets generic error on unknown error', async () => {
    mockLogin.mockRejectedValue(new Error('network error'));
    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      result.current.form.setFieldValue('email', 'test@example.com');
      result.current.form.setFieldValue('password', 'Password1!');
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    expect(result.current.serverError).toBe('Login failed');
  });
});
