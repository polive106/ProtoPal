import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardHeader, CardTitle, CardContent } from '@acme/design-system';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div data-testid="dashboard-page">
      <h1 className="text-3xl font-bold mb-6" data-testid="dashboard-title">
        Welcome, {user?.firstName}!
      </h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Manage your notes and ideas.</p>
            <a href="/notes" className="text-primary hover:underline text-sm mt-2 inline-block" data-testid="dashboard-link-notes">
              View Notes
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
