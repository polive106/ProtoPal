import { createFileRoute, redirect, Outlet, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslation } from '@acme/i18n';
import { Button } from '@acme/design-system';
import { PageSpinner } from '@acme/design-system';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isLoading && !context.auth.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { t } = useTranslation();
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) return <PageSpinner />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b" data-testid="app-header">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <nav className="flex items-center gap-6">
            <a href="/dashboard" className="text-lg font-semibold font-heading" data-testid="nav-link-home">
              {t('appName')}
            </a>
            <a href="/notes" className="text-sm text-muted-foreground hover:text-foreground" data-testid="nav-link-notes">
              {t('nav.notes')}
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground" data-testid="app-user-name">
              {user?.firstName} {user?.lastName}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout();
                navigate({ to: '/login' });
              }}
              data-testid="app-btn-logout"
            >
              {t('logout')}
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
