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
import { useRegistrationForm } from './useRegistrationForm';

describe('useRegistrationForm', () => {
  const mockRegister = vi.fn();
  const mockReplace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ replace: mockReplace } as any);
    vi.mocked(useAuth).mockReturnValue({
      login: vi.fn(),
      logout: vi.fn(),
      register: mockRegister,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('initializes with empty form and no errors', () => {
    const { result } = renderHook(() => useRegistrationForm());

    expect(result.current.serverError).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('calls register and navigates to login on success', async () => {
    mockRegister.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRegistrationForm());

    await act(async () => {
      result.current.form.setFieldValue('firstName', 'Test');
      result.current.form.setFieldValue('lastName', 'User');
      result.current.form.setFieldValue('email', 'test@example.com');
      result.current.form.setFieldValue('password', 'Password1!');
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    expect(mockRegister).toHaveBeenCalledWith({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'Password1!',
    });
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('sets server error on ApiError', async () => {
    mockRegister.mockRejectedValue(new ApiError(400, 'Email already exists'));
    const { result } = renderHook(() => useRegistrationForm());

    await act(async () => {
      result.current.form.setFieldValue('firstName', 'Test');
      result.current.form.setFieldValue('lastName', 'User');
      result.current.form.setFieldValue('email', 'taken@example.com');
      result.current.form.setFieldValue('password', 'Password1!');
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    expect(result.current.serverError).toBe('Email already exists');
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('sets generic error on unknown error', async () => {
    mockRegister.mockRejectedValue(new Error('network error'));
    const { result } = renderHook(() => useRegistrationForm());

    await act(async () => {
      result.current.form.setFieldValue('firstName', 'Test');
      result.current.form.setFieldValue('lastName', 'User');
      result.current.form.setFieldValue('email', 'test@example.com');
      result.current.form.setFieldValue('password', 'Password1!');
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    expect(result.current.serverError).toBe('Registration failed');
  });
});
