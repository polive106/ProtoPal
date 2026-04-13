import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { CheckEmailPage } from '@/features/auth';
import { PublicPageLayout } from '@/components/PublicPageLayout';

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
  return (
    <PublicPageLayout>
      <CheckEmailPage email={email} />
    </PublicPageLayout>
  );
}
