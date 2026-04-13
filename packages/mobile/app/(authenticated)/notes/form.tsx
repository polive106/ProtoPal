import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { PageSpinner, ErrorAlert } from '@acme/design-system-mobile';
import { useTranslation } from '@acme/i18n';
import { useNote } from '@/features/notes/hooks';
import { NoteForm } from '@/features/notes/ui/NoteForm';

export default function NoteFormScreen() {
  const { noteId } = useLocalSearchParams<{ noteId?: string }>();
  const { t } = useTranslation('notes');

  if (noteId) {
    return <EditNoteForm noteId={noteId} />;
  }

  return (
    <>
      <Stack.Screen options={{ title: t('drawer.newTitle') }} />
      <NoteForm />
    </>
  );
}

function EditNoteForm({ noteId }: { noteId: string }) {
  const { t } = useTranslation('notes');
  const { data: note, isLoading, error } = useNote(noteId);

  if (isLoading) return <PageSpinner label={t('detail.loading')} />;
  if (error) return <ErrorAlert testID="notes-alert-error" message={error.message} />;
  if (!note) return <ErrorAlert testID="notes-alert-error" message={t('detail.notFound')} />;

  return (
    <>
      <Stack.Screen options={{ title: t('drawer.editTitle') }} />
      <NoteForm note={{ id: note.id, title: note.title, content: note.content }} />
    </>
  );
}
