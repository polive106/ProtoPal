import { useQuery } from '@tanstack/react-query';
import { notesApi } from '../api';
import { queryKeys } from '@/lib/queryKeys';

export function useNotes() {
  return useQuery({
    queryKey: queryKeys.notes.all,
    queryFn: () => notesApi.list(),
  });
}
