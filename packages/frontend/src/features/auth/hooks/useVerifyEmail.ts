import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api';

export function useVerifyEmail(token: string) {
  const mutation = useMutation({
    mutationFn: (t: string) => authApi.verifyEmail(t),
    retry: false,
  });

  useEffect(() => {
    if (token) {
      mutation.mutate(token);
    }
  }, [token]);

  return {
    data: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
