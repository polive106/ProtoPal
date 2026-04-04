import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'expo-router';
import { ApiError } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import { notesApi } from '../api';
import { noteFormSchema } from '../schemas';

interface NoteForEdit {
  id: string;
  title: string;
  content: string;
}

export function useNoteForm(note?: NoteForEdit) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const isEdit = !!note;

  const form = useForm({
    defaultValues: {
      title: note?.title ?? '',
      content: note?.content ?? '',
    },
    validators: { onChange: noteFormSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      setIsPending(true);
      try {
        if (isEdit) {
          await notesApi.update(note!.id, value);
          queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
          queryClient.invalidateQueries({ queryKey: queryKeys.notes.detail(note!.id) });
        } else {
          await notesApi.create(value);
          queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
        }
        router.back();
      } catch (error) {
        if (error instanceof ApiError) {
          setServerError(error.message);
        } else {
          setServerError('Failed to save note');
        }
      } finally {
        setIsPending(false);
      }
    },
  });

  return { form, serverError, setServerError, isPending, isEdit };
}
