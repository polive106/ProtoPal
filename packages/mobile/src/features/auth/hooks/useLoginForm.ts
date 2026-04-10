import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { ApiError } from '@/lib/api';
import { loginSchema } from '../schemas';
import i18n from '@acme/i18n';

export function useLoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onChange: loginSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      setIsPending(true);
      try {
        await login(value.email, value.password);
        router.replace('/(authenticated)/dashboard');
      } catch (error) {
        if (error instanceof ApiError) {
          setServerError(error.message);
        } else {
          setServerError(i18n.t('login.fallbackError', { ns: 'auth' }));
        }
      } finally {
        setIsPending(false);
      }
    },
  });

  return { form, serverError, setServerError, isPending };
}
