import React from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@acme/design-system';
import { useTranslation } from '@acme/i18n';
import { useVerifyEmail } from '../hooks';

interface VerifyEmailPageProps {
  token: string;
}

export function VerifyEmailPage({ token }: VerifyEmailPageProps) {
  const { t } = useTranslation('auth');
  const { data, isLoading, isError, error } = useVerifyEmail(token);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md" data-testid="verify-card">
        {isLoading ? (
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground" data-testid="verify-text-loading">
              {t('verify.loading')}
            </p>
          </CardContent>
        ) : isError ? (
          <>
            <CardHeader>
              <CardTitle>{t('verify.failedTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-sm text-destructive"
                data-testid="verify-alert-error"
              >
                {error?.message || t('verify.failedMessage')}
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button asChild className="w-full">
                <a href="/register" data-testid="verify-link-register">
                  {t('verify.registerAgain')}
                </a>
              </Button>
              <p className="text-sm text-muted-foreground">
                {t('verify.hasAccount')}{' '}
                <a
                  href="/login"
                  className="text-primary hover:underline"
                  data-testid="verify-link-login"
                >
                  {t('verify.signIn')}
                </a>
              </p>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>{t('verify.successTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-sm text-muted-foreground"
                data-testid="verify-alert-success"
              >
                {data?.message || t('verify.successMessage')}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <a href="/login" data-testid="verify-link-login">
                  {t('verify.signInButton')}
                </a>
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
