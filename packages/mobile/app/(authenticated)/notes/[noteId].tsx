import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
    <ScrollView testID="notes-detail-screen" className="flex-1 px-4 pt-4">
      <Text testID="notes-detail-title" className="text-2xl font-bold text-gray-900">
        {note.title}
      </Text>
      <Text className="mt-1 text-xs text-gray-400">
        {new Date(note.updatedAt).toLocaleDateString()}
      </Text>
      <Text testID="notes-detail-content" className="mt-4 text-base text-gray-700 leading-6">
        {note.content}
      </Text>

      <View className="mt-8 flex-row gap-3">
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
