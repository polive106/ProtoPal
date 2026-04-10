import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  Button,
  PageSpinner,
  ErrorAlert,
  ConfirmDialog,
} from '@acme/design-system-mobile';
import { useNote, useDeleteNote } from '@/features/notes/hooks';

export default function NoteDetailScreen() {
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const router = useRouter();
  const { data: note, isLoading, error } = useNote(noteId!);
  const deleteNote = useDeleteNote();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) return <PageSpinner label="Loading note..." />;
  if (error) return <ErrorAlert testID="notes-alert-error" message={error.message} />;
  if (!note) return <ErrorAlert testID="notes-alert-error" message="Note not found" />;

  return (
    <ScrollView testID="notes-detail-screen" className="flex-1 px-5 pt-6">
      <Stack.Screen options={{ title: note.title }} />

      <Text
        testID="notes-detail-title"
        className="text-2xl text-ink"
        style={{ fontFamily: 'SourceSerif4_600SemiBold' }}
      >
        {note.title}
      </Text>
      <Text
        className="mt-2 text-xs text-ink-light"
        style={{ fontFamily: 'Karla_400Regular' }}
      >
        {new Date(note.updatedAt).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>
      <Text
        testID="notes-detail-content"
        className="mt-6 text-base text-ink leading-7"
        style={{ fontFamily: 'Karla_400Regular' }}
      >
        {note.content}
      </Text>

      <View className="mt-10 flex-row gap-4 pb-8">
        <Button
          testID="notes-btn-edit"
          variant="outline"
          className="flex-1"
          onPress={() => router.push(`/(authenticated)/notes/form?noteId=${note.id}`)}
        >
          Edit
        </Button>
        <Button
          testID="notes-btn-delete"
          variant="destructive"
          className="flex-1"
          onPress={() => setShowDeleteConfirm(true)}
        >
          Delete
        </Button>
      </View>

      <ConfirmDialog
        testID="notes-confirm-delete"
        visible={showDeleteConfirm}
        title="Delete Note"
        message="Are you sure you want to delete this note? This cannot be undone."
        onConfirm={() => {
          deleteNote.mutate(note.id, {
            onSuccess: () => router.back(),
          });
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </ScrollView>
  );
}
