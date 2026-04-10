import React from 'react';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, ErrorAlert } from '@acme/design-system';
import { useTranslation } from '@acme/i18n';
import { useResetPasswordForm } from '../hooks';
import { handleFormSubmit, getFieldError } from '@/lib/formUtils';

interface ResetPasswordPageProps {
  token: string;
}

export function ResetPasswordPage({ token }: ResetPasswordPageProps) {
  const { t } = useTranslation('auth');
  const { form, serverError, setServerError, isLoading, isSuccess } = useResetPasswordForm(token);

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md" data-testid="reset-password-card">
        <CardHeader>
          <CardTitle>{t('resetPassword.successTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground" data-testid="reset-password-success">
            {t('resetPassword.successMessage')}
          </p>
        </CardContent>
        <CardFooter>
          <a href="/login" className="text-primary hover:underline" data-testid="reset-password-link-login">
            {t('resetPassword.signIn')}
          </a>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md" data-testid="reset-password-card">
      <CardHeader>
        <CardTitle>{t('resetPassword.title')}</CardTitle>
        <CardDescription>{t('resetPassword.description')}</CardDescription>
      </CardHeader>
      <form onSubmit={handleFormSubmit(() => form.handleSubmit())} noValidate>
        <CardContent className="space-y-4">
          {serverError && <ErrorAlert data-testid="reset-password-alert-error" message={serverError} onDismiss={() => setServerError(null)} />}

          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="new-password">{t('resetPassword.passwordLabel')}</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  data-testid="reset-password-input-password"
                />
                <p className="text-xs text-muted-foreground">
                  {t('resetPassword.passwordHint')}
                </p>
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive" data-testid="reset-password-error-password">{getFieldError(field.state.meta.errors)}</p>
                )}
              </div>
            )}
          </form.Field>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading} data-testid="reset-password-btn-submit">
            {isLoading ? t('resetPassword.submitting') : t('resetPassword.submit')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
