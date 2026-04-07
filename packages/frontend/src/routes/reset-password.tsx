import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { ResetPasswordPage } from '@/features/auth';

const searchSchema = z.object({
  token: z.string().optional().default(''),
});

export const Route = createFileRoute('/reset-password')({
  validateSearch: searchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/dashboard' });
    }
    if (!search.token) {
      throw redirect({ to: '/login' });
    }
  },
  component: ResetPasswordRoute,
});

function ResetPasswordRoute() {
  const { token } = Route.useSearch();
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <ResetPasswordPage token={token} />
    </div>
  );
}
