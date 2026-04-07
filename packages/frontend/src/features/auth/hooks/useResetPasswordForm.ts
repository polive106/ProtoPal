import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { authApi } from '../api';
import { ApiError } from '@/lib/api';
import { resetPasswordSchema } from '../schemas';

export function useResetPasswordForm(token: string) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm({
    defaultValues: { password: '' },
    validators: { onChange: resetPasswordSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      setIsLoading(true);
      try {
        await authApi.resetPassword({ token, password: value.password });
        setIsSuccess(true);
      } catch (error) {
        if (error instanceof ApiError) {
          setServerError(error.message);
        } else {
          setServerError('Something went wrong. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  return { form, serverError, setServerError, isLoading, isSuccess };
}
