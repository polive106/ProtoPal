import { z } from 'zod';
import { INPUT_LIMITS } from '@acme/shared';

export const createNoteSchema = z.object({
  title: z.string().min(1).max(INPUT_LIMITS.NOTE_TITLE_MAX),
  content: z.string().min(1).max(INPUT_LIMITS.NOTE_CONTENT_MAX),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(INPUT_LIMITS.NOTE_TITLE_MAX).optional(),
  content: z.string().min(1).max(INPUT_LIMITS.NOTE_CONTENT_MAX).optional(),
});

export type CreateNoteDto = z.infer<typeof createNoteSchema>;
export type UpdateNoteDto = z.infer<typeof updateNoteSchema>;
