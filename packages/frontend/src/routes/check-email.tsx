import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { CheckEmailPage } from '@/features/auth';

const searchSchema = z.object({
  email: z.string().optional().default(''),
});

export const Route = createFileRoute('/check-email')({
  validateSearch: searchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/dashboard' });
    }
    if (!search.email) {
      throw redirect({ to: '/register' });
    }
  },
  component: CheckEmailRoute,
});

function CheckEmailRoute() {
  const { email } = Route.useSearch();
  return <CheckEmailPage email={email} />;
}
