import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRegistrationForm } from './useRegistrationForm';
import { ApiError } from '@/lib/api';

const mockNavigate = vi.fn();

vi.mock('../api', () => ({
  authApi: {
    register: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

const validFormData = {
  email: 'john@example.com',
  password: 'Password1',
  firstName: 'John',
  lastName: 'Doe',
};

describe('useRegistrationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty form data', () => {
    const { result } = renderHook(() => useRegistrationForm());

    expect(result.current.form.state.values).toEqual({ email: '', password: '', firstName: '', lastName: '' });
    expect(result.current.serverError).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('form.handleSubmit calls authApi.register and navigates to /check-email', async () => {
    const { authApi } = await import('../api');

    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.form.setFieldValue('email', validFormData.email);
      result.current.form.setFieldValue('password', validFormData.password);
      result.current.form.setFieldValue('firstName', validFormData.firstName);
      result.current.form.setFieldValue('lastName', validFormData.lastName);
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    expect(authApi.register).toHaveBeenCalledWith(validFormData);
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/check-email', search: { email: validFormData.email } });
  });

  it('sets serverError when register fails with ApiError', async () => {
    const { authApi } = await import('../api');
    (authApi.register as ReturnType<typeof vi.fn>).mockRejectedValue(new ApiError(400, 'Email taken'));

    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.form.setFieldValue('email', validFormData.email);
      result.current.form.setFieldValue('password', validFormData.password);
      result.current.form.setFieldValue('firstName', validFormData.firstName);
      result.current.form.setFieldValue('lastName', validFormData.lastName);
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    expect(result.current.serverError).toBe('Email taken');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('sets generic serverError when register fails with non-ApiError', async () => {
    const { authApi } = await import('../api');
    (authApi.register as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.form.setFieldValue('email', validFormData.email);
      result.current.form.setFieldValue('password', validFormData.password);
      result.current.form.setFieldValue('firstName', validFormData.firstName);
      result.current.form.setFieldValue('lastName', validFormData.lastName);
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    expect(result.current.serverError).toBe('Registration failed');
  });
});
