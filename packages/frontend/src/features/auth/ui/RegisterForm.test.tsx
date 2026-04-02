import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { RegisterForm } from './RegisterForm';

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
      isLoading: false,
    },
  };
});

vi.mock('../hooks', () => ({
  useRegistrationForm: vi.fn().mockReturnValue(defaultMock),
}));

vi.mock('@/lib/formUtils', () => ({
  handleFormSubmit: (handler: () => void) => (e: any) => { e?.preventDefault?.(); handler(); },
  getFieldError: (errors: unknown[]) => errors.length > 0 ? String(errors[0]) : undefined,
}));

describe('RegisterForm', () => {
  it('renders all form fields', () => {
    render(<RegisterForm />);
    expect(screen.getByTestId('register-input-firstName')).toBeInTheDocument();
    expect(screen.getByTestId('register-input-lastName')).toBeInTheDocument();
    expect(screen.getByTestId('register-input-email')).toBeInTheDocument();
    expect(screen.getByTestId('register-input-password')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<RegisterForm />);
    expect(screen.getByTestId('register-btn-submit')).toBeInTheDocument();
  });

  it('renders sign-in link', () => {
    render(<RegisterForm />);
    expect(screen.getByTestId('register-link-login')).toBeInTheDocument();
  });

  it('renders error alert when serverError exists', async () => {
    const { useRegistrationForm } = await import('../hooks');
    (useRegistrationForm as ReturnType<typeof vi.fn>).mockReturnValue({
      ...defaultMock,
      serverError: 'Email taken',
    });

    render(<RegisterForm />);
    expect(screen.getByTestId('register-alert-error')).toBeInTheDocument();
  });
});
