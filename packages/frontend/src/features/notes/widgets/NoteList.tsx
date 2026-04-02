import React from 'react';
import { Button, PageSpinner, EmptyState, ErrorAlert } from '@acme/design-system';
import { useNotes, useDeleteNote } from '../hooks';
import { NoteCard } from './NoteCard';

interface NoteListProps {
  onEdit: (note: { id: string; title: string; content: string }) => void;
  onCreate: () => void;
}

export function NoteList({ onEdit, onCreate }: NoteListProps) {
  const { data: notes, isLoading, error } = useNotes();
  const deleteNote = useDeleteNote();

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorAlert message={error.message} />;

  if (!notes || notes.length === 0) {
    return (
      <EmptyState
        title="No notes yet"
        description="Create your first note to get started."
        action={
          <Button onClick={onCreate} data-testid="notes-btn-create-empty">
            Create Note
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="notes-list">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          id={note.id}
          title={note.title}
          content={note.content}
          updatedAt={note.updatedAt}
          onEdit={onEdit}
          onDelete={(id) => deleteNote.mutate(id)}
        />
      ))}
    </div>
  );
}
