import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { ApiError } from '@/lib/api';
import { loginSchema } from '../schemas';

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
          setServerError('Login failed');
        }
      } finally {
        setIsPending(false);
      }
    },
  });

  return { form, serverError, setServerError, isPending };
}
