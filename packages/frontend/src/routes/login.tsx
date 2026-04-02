import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginForm } from '@/features/auth';

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <LoginForm />
    </div>
  );
}
