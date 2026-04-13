import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { authApi } from '../api';
import { ApiError } from '@/lib/api';
import { forgotPasswordSchema } from '../schemas';
import i18n from '@acme/i18n';

export function useForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm({
    defaultValues: { email: '' },
    validators: { onChange: forgotPasswordSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      setIsLoading(true);
      try {
        await authApi.forgotPassword(value.email);
        setIsSubmitted(true);
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

  return { form, serverError, setServerError, isLoading, isSubmitted };
}
