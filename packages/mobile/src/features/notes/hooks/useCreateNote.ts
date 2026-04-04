import { useMutation } from '@tanstack/react-query';
import { notesApi } from '../api';
import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';

export function useCreateNote() {
  return useMutation({
    mutationFn: (data: { title: string; content: string }) => notesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
  });
}
