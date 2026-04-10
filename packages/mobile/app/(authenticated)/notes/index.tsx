import React, { useState, useCallback } from 'react';
import { FlatList, View, Text, RefreshControl } from 'react-native';
import { useRouter, Stack } from 'expo-router';
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
  const { data: notes, isLoading, error, refetch } = useNotes();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) return <PageSpinner label="Loading notes..." />;
  if (error) return <ErrorAlert testID="notes-alert-error" message={error.message} />;

  if (!notes || notes.length === 0) {
    return (
      <>
        <Stack.Screen
          options={{
            headerRight: () => (
              <Button
                testID="notes-btn-create"
                size="sm"
                onPress={() => router.push('/(authenticated)/notes/form')}
              >
                New Note
              </Button>
            ),
          }}
        />
        <EmptyState
          testID="notes-empty-state"
          title="No notes yet"
          description="Create your first note to get started."
          icon={<Text className="text-4xl">📝</Text>}
          action={
            <Button
              testID="notes-btn-create"
              onPress={() => router.push('/(authenticated)/notes/form')}
            >
              Create Note
            </Button>
          }
        />
      </>
    );
  }

  return (
    <View testID="notes-list" className="flex-1">
      <Stack.Screen
        options={{
          headerRight: () => (
            <Button
              testID="notes-btn-create"
              size="sm"
              onPress={() => router.push('/(authenticated)/notes/form')}
            >
              New Note
            </Button>
          ),
        }}
      />

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-4 px-5 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
