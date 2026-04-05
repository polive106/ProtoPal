import React from 'react';
import { FlatList, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Button,
  PageSpinner,
  ErrorAlert,
  EmptyState,
} from '@acme/design-system-mobile';
import { useNotes } from '@/features/notes/hooks';
import { NoteCard } from '@/features/notes/widgets/NoteCard';

export default function NotesListScreen() {
  const router = useRouter();
  const { data: notes, isLoading, error } = useNotes();

  if (isLoading) return <PageSpinner label="Loading notes..." />;
  if (error) return <ErrorAlert testID="notes-alert-error" message={error.message} />;

  if (!notes || notes.length === 0) {
    return (
      <EmptyState
        testID="notes-empty-state"
        title="No notes yet"
        description="Create your first note to get started."
        action={
          <Button
            testID="notes-btn-create"
            onPress={() => router.push('/(authenticated)/notes/form')}
          >
            Create Note
          </Button>
        }
      />
    );
  }

  return (
    <View testID="notes-list" className="flex-1">
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">My Notes</Text>
        <Button
          testID="notes-btn-create"
          size="sm"
          onPress={() => router.push('/(authenticated)/notes/form')}
        >
          New Note
        </Button>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-3 px-4 pb-4"
        renderItem={({ item }) => (
          <NoteCard
            id={item.id}
            title={item.title}
            content={item.content}
            updatedAt={item.updatedAt}
            onPress={(id) => router.push(`/(authenticated)/notes/${id}`)}
          />
        )}
      />

    </View>
  );
}
