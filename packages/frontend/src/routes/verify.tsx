import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { VerifyEmailPage } from '@/features/auth';
import { PublicPageLayout } from '@/components/PublicPageLayout';

const searchSchema = z.object({
  token: z.string().optional().default(''),
});

export const Route = createFileRoute('/verify')({
  validateSearch: searchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/dashboard' });
    }
    if (!search.token) {
      throw redirect({ to: '/login' });
    }
  },
  component: VerifyRoute,
});

function VerifyRoute() {
  const { token } = Route.useSearch();
  return (
    <PublicPageLayout>
      <VerifyEmailPage token={token} />
    </PublicPageLayout>
  );
}
