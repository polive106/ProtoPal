import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { authApi } from '../api';
import { ApiError } from '@/lib/api';
import { registrationSchema } from '../schemas';
import i18n, { translateApiError } from '@acme/i18n';

export function useRegistrationForm() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: { email: '', password: '', firstName: '', lastName: '' },
    validators: { onChange: registrationSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      setIsLoading(true);
      try {
        await authApi.register(value);
        navigate({ to: '/check-email', search: { email: value.email } });
      } catch (error) {
        if (error instanceof ApiError) {
          setServerError(translateApiError(error));
        } else {
          setServerError(i18n.t('register.fallbackError', { ns: 'auth' }));
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  return { form, serverError, setServerError, isLoading };
}
