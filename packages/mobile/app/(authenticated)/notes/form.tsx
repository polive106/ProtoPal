import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { PageSpinner, ErrorAlert } from '@acme/design-system-mobile';
import { useNote } from '@/features/notes/hooks';
import { NoteForm } from '@/features/notes/ui/NoteForm';

export default function NoteFormScreen() {
  const { noteId } = useLocalSearchParams<{ noteId?: string }>();

  if (noteId) {
    return <EditNoteForm noteId={noteId} />;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'New Note' }} />
      <NoteForm />
    </>
  );
}

function EditNoteForm({ noteId }: { noteId: string }) {
  const { data: note, isLoading, error } = useNote(noteId);

  if (isLoading) return <PageSpinner label="Loading note..." />;
  if (error) return <ErrorAlert testID="notes-alert-error" message={error.message} />;
  if (!note) return <ErrorAlert testID="notes-alert-error" message="Note not found" />;

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Note' }} />
      <NoteForm note={{ id: note.id, title: note.title, content: note.content }} />
    </>
  );
}
