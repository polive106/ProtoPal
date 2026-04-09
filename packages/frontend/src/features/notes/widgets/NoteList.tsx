import React from 'react';
import { Button, PageSpinner, EmptyState, ErrorAlert } from '@acme/design-system';
import { useTranslation } from '@acme/i18n';
import { useNotes, useDeleteNote } from '../hooks';
import { NoteCard } from './NoteCard';

interface NoteListProps {
  onEdit: (note: { id: string; title: string; content: string }) => void;
  onCreate: () => void;
}

export function NoteList({ onEdit, onCreate }: NoteListProps) {
  const { t } = useTranslation('notes');
  const { data: notes, isLoading, error } = useNotes();
  const deleteNote = useDeleteNote();

  if (isLoading) return <PageSpinner data-testid="notes-loading" />;
  if (error) return <ErrorAlert data-testid="notes-alert-error" message={error.message} />;

  if (!notes || notes.length === 0) {
    return (
      <EmptyState
        data-testid="notes-empty"
        title={t('empty.title')}
        description={t('empty.description')}
        action={
          <Button onClick={onCreate} data-testid="notes-btn-create-empty">
            {t('empty.createButton')}
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
