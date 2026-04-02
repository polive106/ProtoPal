import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { LoginForm } from './LoginForm';

const { mockForm, defaultMock } = vi.hoisted(() => {
  const mockForm = {
    Field: ({ children }: any) => children({
      state: { value: '', meta: { isTouched: false, errors: [] } },
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
    }),
    handleSubmit: vi.fn(),
  };
  return {
    mockForm,
    defaultMock: {
      form: mockForm,
      serverError: null as string | null,
      setServerError: vi.fn(),
      isPending: false,
    },
  };
});

vi.mock('../hooks', () => ({
  useLoginForm: vi.fn().mockReturnValue(defaultMock),
}));

vi.mock('@/lib/formUtils', () => ({
  handleFormSubmit: (handler: () => void) => (e: any) => { e?.preventDefault?.(); handler(); },
  getFieldError: (errors: unknown[]) => errors.length > 0 ? String(errors[0]) : undefined,
}));

describe('LoginForm', () => {
  it('renders email and password inputs', () => {
    render(<LoginForm />);
    expect(screen.getByTestId('login-input-email')).toBeInTheDocument();
    expect(screen.getByTestId('login-input-password')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<LoginForm />);
    expect(screen.getByTestId('login-btn-submit')).toBeInTheDocument();
    expect(screen.getByTestId('login-btn-submit')).not.toBeDisabled();
  });

  it('disables submit button when loading', async () => {
    const { useLoginForm } = await import('../hooks');
    (useLoginForm as ReturnType<typeof vi.fn>).mockReturnValue({
      ...defaultMock,
      isPending: true,
    });

    render(<LoginForm />);
    expect(screen.getByTestId('login-btn-submit')).toBeDisabled();
  });

  it('renders error alert when serverError exists', async () => {
    const { useLoginForm } = await import('../hooks');
    (useLoginForm as ReturnType<typeof vi.fn>).mockReturnValue({
      ...defaultMock,
      serverError: 'Invalid credentials',
    });

    render(<LoginForm />);
    expect(screen.getByTestId('login-alert-error')).toBeInTheDocument();
  });

  it('renders register link', () => {
    render(<LoginForm />);
    expect(screen.getByTestId('login-link-register')).toBeInTheDocument();
  });
});
