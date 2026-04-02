import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, type LoginRequest } from '../api';
import { queryKeys } from '@/lib/queryKeys';

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: queryKeys.auth.me });
    },
  });
}
