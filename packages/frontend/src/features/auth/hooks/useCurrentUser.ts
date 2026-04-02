import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api';
import { queryKeys } from '@/lib/queryKeys';

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      return response.user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
