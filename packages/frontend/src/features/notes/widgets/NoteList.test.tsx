import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { NoteList } from './NoteList';

const mockUseNotes = vi.fn();
const mockUseDeleteNote = vi.fn().mockReturnValue({ mutate: vi.fn() });

vi.mock('../hooks', () => ({
  useNotes: (...args: any[]) => mockUseNotes(...args),
  useDeleteNote: (...args: any[]) => mockUseDeleteNote(...args),
}));

describe('NoteList', () => {
  const defaultProps = {
    onEdit: vi.fn(),
    onCreate: vi.fn(),
  };

  it('renders loading spinner when loading', () => {
    mockUseNotes.mockReturnValue({ data: undefined, isLoading: true, error: null });
    render(<NoteList {...defaultProps} />);
    // PageSpinner renders a spinner
    expect(screen.queryByTestId('notes-list')).not.toBeInTheDocument();
  });

  it('renders error alert on error', () => {
    mockUseNotes.mockReturnValue({ data: undefined, isLoading: false, error: new Error('Failed') });
    render(<NoteList {...defaultProps} />);
    expect(screen.queryByTestId('notes-list')).not.toBeInTheDocument();
  });

  it('renders empty state when no notes', () => {
    mockUseNotes.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<NoteList {...defaultProps} />);
    expect(screen.getByText('No notes yet')).toBeInTheDocument();
  });

  it('renders NoteCard grid when notes exist', () => {
    mockUseNotes.mockReturnValue({
      data: [
        { id: '1', title: 'Note 1', content: 'Body 1', updatedAt: '2024-01-01T00:00:00Z', userId: 'u1', createdAt: '' },
      ],
      isLoading: false,
      error: null,
    });
    render(<NoteList {...defaultProps} />);
    expect(screen.getByTestId('notes-list')).toBeInTheDocument();
    expect(screen.getByTestId('notes-title-1')).toHaveTextContent('Note 1');
  });
});
