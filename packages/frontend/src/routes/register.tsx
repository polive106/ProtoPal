import { createFileRoute, redirect } from '@tanstack/react-router';
import { RegisterForm } from '@/features/auth';

export const Route = createFileRoute('/register')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <RegisterForm />
    </div>
  );
}
