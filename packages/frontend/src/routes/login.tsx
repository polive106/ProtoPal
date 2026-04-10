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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-semibold text-foreground">ProtoPal</h1>
          <p className="text-sm text-muted-foreground mt-1">Your thoughtful digital notebook</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
