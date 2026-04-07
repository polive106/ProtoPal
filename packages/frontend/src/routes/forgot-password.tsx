import { createFileRoute, redirect } from '@tanstack/react-router';
import { ForgotPasswordPage } from '@/features/auth';

export const Route = createFileRoute('/forgot-password')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: ForgotPasswordRoute,
});

function ForgotPasswordRoute() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <ForgotPasswordPage />
    </div>
  );
}
