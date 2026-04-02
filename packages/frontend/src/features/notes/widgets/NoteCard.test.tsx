import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { NoteCard } from './NoteCard';

describe('NoteCard', () => {
  const defaultProps = {
    id: 'n1',
    title: 'Test Title',
    content: 'Test content body',
    updatedAt: '2024-01-15T00:00:00.000Z',
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it('renders title, content, and date', () => {
    render(<NoteCard {...defaultProps} />);

    expect(screen.getByTestId('notes-title-n1')).toHaveTextContent('Test Title');
    expect(screen.getByTestId('notes-content-n1')).toHaveTextContent('Test content body');
  });

  it('calls onEdit with note data when edit clicked', () => {
    const onEdit = vi.fn();
    render(<NoteCard {...defaultProps} onEdit={onEdit} />);

    fireEvent.click(screen.getByTestId('notes-btn-edit-n1'));

    expect(onEdit).toHaveBeenCalledWith({ id: 'n1', title: 'Test Title', content: 'Test content body' });
  });

  it('calls onDelete with id when delete clicked', () => {
    const onDelete = vi.fn();
    render(<NoteCard {...defaultProps} onDelete={onDelete} />);

    fireEvent.click(screen.getByTestId('notes-btn-delete-n1'));

    expect(onDelete).toHaveBeenCalledWith('n1');
  });
});
