import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslation } from '@acme/i18n';
import { Card, CardHeader, CardTitle, CardContent } from '@acme/design-system';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div data-testid="dashboard-page">
      <h1 className="text-3xl font-bold mb-6 font-heading" data-testid="dashboard-title">
        {t('dashboard.welcome', { firstName: user?.firstName })}
      </h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.notesTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('dashboard.notesDescription')}</p>
            <a href="/notes" className="text-primary hover:underline text-sm mt-2 inline-block" data-testid="dashboard-link-notes">
              {t('dashboard.viewNotes')}
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
