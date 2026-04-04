import { api } from '@/lib/api';

export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const notesApi = {
  list: () => api.get<{ notes: Note[] }>('/notes').then((r) => r.notes),
  get: (id: string) => api.get<{ note: Note }>(`/notes/${id}`).then((r) => r.note),
  create: (data: { title: string; content: string }) =>
    api.post<{ note: Note }>('/notes', data).then((r) => r.note),
  update: (id: string, data: { title?: string; content?: string }) =>
    api.patch<{ note: Note }>(`/notes/${id}`, data).then((r) => r.note),
  delete: (id: string) => api.delete(`/notes/${id}`),
};
