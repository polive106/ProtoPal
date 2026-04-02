import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLoginForm } from './useLoginForm';
import { ApiError } from '@/lib/api';

const mockMutateAsync = vi.fn();
const mockNavigate = vi.fn();

vi.mock('./useLogin', () => ({
  useLogin: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}));

vi.mock('./useLogin', () => ({
  useLogin: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

describe('useLoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue(undefined);
  });

  it('initializes with empty values and no server error', () => {
    const { result } = renderHook(() => useLoginForm());

    expect(result.current.form.state.values).toEqual({ email: '', password: '' });
    expect(result.current.serverError).toBeNull();
    expect(result.current.isPending).toBe(false);
  });

  it('form.handleSubmit calls mutateAsync and navigates on success', async () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.form.setFieldValue('email', 'test@test.com');
      result.current.form.setFieldValue('password', 'password123');
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password123' });
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/dashboard' });
  });

  it('sets serverError when mutateAsync throws ApiError', async () => {
    mockMutateAsync.mockRejectedValue(new ApiError(401, 'Invalid credentials'));

    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.form.setFieldValue('email', 'test@test.com');
      result.current.form.setFieldValue('password', 'password123');
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    expect(result.current.serverError).toBe('Invalid credentials');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('sets generic serverError when mutateAsync throws non-ApiError', async () => {
    mockMutateAsync.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.form.setFieldValue('email', 'test@test.com');
      result.current.form.setFieldValue('password', 'password123');
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    expect(result.current.serverError).toBe('Login failed');
  });
});
