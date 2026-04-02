import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
});

export type CreateNoteDto = z.infer<typeof createNoteSchema>;
export type UpdateNoteDto = z.infer<typeof updateNoteSchema>;
