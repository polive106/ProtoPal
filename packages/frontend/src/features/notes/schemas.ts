import { z } from 'zod';

export const noteFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

export type NoteFormData = z.infer<typeof noteFormSchema>;
