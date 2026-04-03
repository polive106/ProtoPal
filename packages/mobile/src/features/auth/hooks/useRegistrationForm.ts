import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { ApiError } from '@/lib/api';
import { registrationSchema } from '../schemas';

export function useRegistrationForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: { email: '', password: '', firstName: '', lastName: '' },
    validators: { onChange: registrationSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      setIsLoading(true);
      try {
        await register(value);
        router.replace('/(auth)/login');
      } catch (error) {
        if (error instanceof ApiError) {
          setServerError(error.message);
        } else {
          setServerError('Registration failed');
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  return { form, serverError, setServerError, isLoading };
}
