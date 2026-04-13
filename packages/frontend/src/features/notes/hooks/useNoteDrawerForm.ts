import { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { noteFormSchema } from '../schemas';
import { ApiError } from '@/lib/api';
import i18n from '@acme/i18n';

interface UseNoteDrawerFormOptions {
  open: boolean;
  note?: { id: string; title: string; content: string };
  onSubmit: (data: { title: string; content: string }) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export function useNoteDrawerForm({ open, note, onSubmit, onOpenChange }: UseNoteDrawerFormOptions) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!note;

  const form = useForm({
    defaultValues: {
      title: note?.title ?? '',
      content: note?.content ?? '',
    },
    validators: { onChange: noteFormSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      setIsLoading(true);
      try {
        await onSubmit(value);
        onOpenChange(false);
      } catch (error: unknown) {
        if (error instanceof ApiError) {
          setServerError(
            error.errorKey
              ? i18n.t(error.errorKey, { ns: 'errors', defaultValue: error.message })
              : error.message,
          );
        } else {
          setServerError(i18n.t('drawer.save.fallbackError', { ns: 'notes' }));
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: note?.title ?? '',
        content: note?.content ?? '',
      });
      setServerError(null);
    }
  }, [open, note?.id]);

  const handleCancel = () => onOpenChange(false);

  return { form, serverError, setServerError, isLoading, isEdit, handleCancel };
}
