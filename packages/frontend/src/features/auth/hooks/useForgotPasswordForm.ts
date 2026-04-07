import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { authApi } from '../api';
import { ApiError } from '@/lib/api';
import { forgotPasswordSchema } from '../schemas';

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
          setServerError(error.message);
        } else {
          setServerError('Something went wrong. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  return { form, serverError, setServerError, isLoading, isSubmitted };
}
