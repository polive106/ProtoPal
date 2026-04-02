import { useMutation } from '@tanstack/react-query';
import { notesApi } from '../api';
import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';

export function useUpdateNote() {
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; content?: string }) =>
      notesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.detail(variables.id) });
    },
  });
}
