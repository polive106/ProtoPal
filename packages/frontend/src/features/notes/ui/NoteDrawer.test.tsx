import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { NoteDrawer } from './NoteDrawer';

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
      isEdit: false,
      handleCancel: vi.fn(),
    },
  };
});

vi.mock('../hooks', () => ({
  useNoteDrawerForm: vi.fn().mockReturnValue(defaultMock),
}));

vi.mock('@/lib/formUtils', () => ({
  handleFormSubmit: (handler: () => void) => (e: any) => { e?.preventDefault?.(); handler(); },
  getFieldError: (errors: unknown[]) => errors.length > 0 ? String(errors[0]) : undefined,
}));

describe('NoteDrawer', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSubmit: vi.fn(),
  };

  it('renders "New Note" title when not editing', () => {
    render(<NoteDrawer {...defaultProps} />);
    expect(screen.getByText('New Note')).toBeInTheDocument();
  });

  it('renders "Edit Note" title when editing', async () => {
    const { useNoteDrawerForm } = await import('../hooks');
    (useNoteDrawerForm as ReturnType<typeof vi.fn>).mockReturnValue({
      ...defaultMock,
      isEdit: true,
    });

    render(<NoteDrawer {...defaultProps} />);
    expect(screen.getByText('Edit Note')).toBeInTheDocument();
  });

  it('renders form inputs', () => {
    render(<NoteDrawer {...defaultProps} />);
    expect(screen.getByTestId('notes-input-title')).toBeInTheDocument();
    expect(screen.getByTestId('notes-input-content')).toBeInTheDocument();
  });

  it('disables save button when loading', async () => {
    const { useNoteDrawerForm } = await import('../hooks');
    (useNoteDrawerForm as ReturnType<typeof vi.fn>).mockReturnValue({
      ...defaultMock,
      isLoading: true,
    });

    render(<NoteDrawer {...defaultProps} />);
    expect(screen.getByTestId('notes-btn-save')).toBeDisabled();
  });
});
