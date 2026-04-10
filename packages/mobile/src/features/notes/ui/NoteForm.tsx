import React from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import {
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  ErrorAlert,
} from '@acme/design-system-mobile';
import { useNoteForm } from '../hooks';
import { getFieldError } from '@/lib/formUtils';

interface NoteFormProps {
  note?: { id: string; title: string; content: string };
}

export function NoteForm({ note }: NoteFormProps) {
  const { form, serverError, setServerError, isPending, isEdit } = useNoteForm(note);

  return (
    <ScrollView className="flex-1 px-5 pt-4" testID="notes-form">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Note' : 'New Note'}</CardTitle>
        </CardHeader>
        <CardContent className="gap-4">
          {serverError && (
            <ErrorAlert
              testID="notes-alert-error"
              message={serverError}
              onDismiss={() => setServerError(null)}
            />
          )}

          <form.Field name="title">
            {(field) => (
              <View className="gap-2">
                <Label>Title</Label>
                <Input
                  testID="notes-input-title"
                  value={field.state.value}
                  onChangeText={(text) => field.handleChange(text)}
                  onBlur={() => field.handleBlur()}
                  placeholder="Note title"
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <Text className="text-sm text-red-500">{getFieldError(field.state.meta.errors)}</Text>
                )}
              </View>
            )}
          </form.Field>

          <form.Field name="content">
            {(field) => (
              <View className="gap-2">
                <Label>Content</Label>
                <TextInput
                  testID="notes-input-content"
                  value={field.state.value}
                  onChangeText={(text) => field.handleChange(text)}
                  onBlur={() => field.handleBlur()}
                  placeholder="Write your note..."
                  placeholderTextColor="#a8a29e"
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  className="rounded-xl border border-warmBorder px-4 py-3 text-base text-ink"
                  style={{ fontFamily: 'Karla_400Regular', minHeight: 160 }}
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <Text className="text-sm text-red-500">{getFieldError(field.state.meta.errors)}</Text>
                )}
              </View>
            )}
          </form.Field>
        </CardContent>
        <CardFooter className="gap-3">
          <Button
            testID="notes-btn-save"
            className="flex-1"
            disabled={isPending}
            loading={isPending}
            onPress={() => form.handleSubmit()}
          >
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </CardFooter>
      </Card>
    </ScrollView>
  );
}
