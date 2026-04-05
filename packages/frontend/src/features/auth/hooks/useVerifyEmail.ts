import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api';

export function useVerifyEmail(token: string) {
  return useQuery({
    queryKey: ['auth', 'verify', token],
    queryFn: () => authApi.verifyEmail(token),
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
