import { z } from 'zod';
import { INPUT_LIMITS } from '@acme/shared';

export const noteFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(INPUT_LIMITS.NOTE_TITLE_MAX, `Title must be at most ${INPUT_LIMITS.NOTE_TITLE_MAX} characters`),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(INPUT_LIMITS.NOTE_CONTENT_MAX, `Content must be at most ${INPUT_LIMITS.NOTE_CONTENT_MAX} characters`),
});

export type NoteFormData = z.infer<typeof noteFormSchema>;
