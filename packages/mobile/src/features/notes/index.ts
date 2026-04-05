export { notesApi } from './api';
export type { Note } from '@acme/shared';
export { noteFormSchema, type NoteFormData } from './schemas';
export {
  useNotes,
  useNote,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useNoteForm,
} from './hooks';
