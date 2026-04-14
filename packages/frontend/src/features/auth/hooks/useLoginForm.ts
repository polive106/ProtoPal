import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { useLogin } from './useLogin';
import { ApiError } from '@/lib/api';
import { loginSchema } from '../schemas';
import i18n, { translateApiError } from '@acme/i18n';

export function useLoginForm() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onChange: loginSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        await loginMutation.mutateAsync(value);
        navigate({ to: '/dashboard' });
      } catch (error) {
        if (error instanceof ApiError) {
          setServerError(translateApiError(error));
        } else {
          setServerError(i18n.t('login.fallbackError', { ns: 'auth' }));
        }
      }
    },
  });

  return { form, serverError, setServerError, isPending: loginMutation.isPending };
}
