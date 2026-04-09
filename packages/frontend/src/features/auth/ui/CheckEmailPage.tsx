import React from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  ErrorAlert,
} from '@acme/design-system';
import { useTranslation } from '@acme/i18n';
import { useResendVerification } from '../hooks';

interface CheckEmailPageProps {
  email: string;
}

export function CheckEmailPage({ email }: CheckEmailPageProps) {
  const { t } = useTranslation('auth');
  const resendMutation = useResendVerification();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md" data-testid="check-email-card">
        <CardHeader>
          <CardTitle>{t('checkEmail.title')}</CardTitle>
          <CardDescription>
            {t('checkEmail.description', { email })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {resendMutation.isError && (
            <ErrorAlert
              data-testid="check-email-alert-error"
              message={resendMutation.error?.message || t('checkEmail.resendError')}
              onDismiss={() => resendMutation.reset()}
            />
          )}
          <p className="text-sm text-muted-foreground" data-testid="check-email-text-message">
            {t('checkEmail.message')}
          </p>
          {resendMutation.isSuccess && (
            <p className="text-sm text-green-600" data-testid="check-email-text-resent">
              {t('checkEmail.resent')}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={resendMutation.isPending}
            onClick={() => resendMutation.mutate(email)}
            data-testid="check-email-btn-resend"
          >
            {resendMutation.isPending ? t('checkEmail.resending') : t('checkEmail.resend')}
          </Button>
          <p className="text-sm text-muted-foreground">
            {t('checkEmail.alreadyVerified')}{' '}
            <a
              href="/login"
              className="text-primary hover:underline"
              data-testid="check-email-link-login"
            >
              {t('checkEmail.signIn')}
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
