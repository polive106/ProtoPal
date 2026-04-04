import { useQuery } from '@tanstack/react-query';
import { notesApi } from '../api';
import { queryKeys } from '@/lib/queryKeys';

export function useNote(id: string) {
  return useQuery({
    queryKey: queryKeys.notes.detail(id),
    queryFn: () => notesApi.get(id),
  });
}
