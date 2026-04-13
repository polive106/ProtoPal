import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { authApi } from '../api';
import { ApiError } from '@/lib/api';
import { resetPasswordSchema } from '../schemas';
import i18n from '@acme/i18n';

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
          setServerError(
            error.errorKey
              ? i18n.t(error.errorKey, { ns: 'errors', defaultValue: error.message })
              : error.message,
          );
        } else {
          setServerError(i18n.t('error'));
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  return { form, serverError, setServerError, isLoading, isSuccess };
}
