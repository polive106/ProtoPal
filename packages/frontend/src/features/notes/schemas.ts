import { z } from 'zod';
import { INPUT_LIMITS } from '@acme/shared';

export const noteFormSchema = z.object({
  title: z
    .string()
    .min(1, 'validation.titleRequired')
    .max(INPUT_LIMITS.NOTE_TITLE_MAX, 'validation.titleMaxLength'),
  content: z
    .string()
    .min(1, 'validation.contentRequired')
    .max(INPUT_LIMITS.NOTE_CONTENT_MAX, 'validation.contentMaxLength'),
});

export type NoteFormData = z.infer<typeof noteFormSchema>;
