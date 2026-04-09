import React from 'react';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, ErrorAlert } from '@acme/design-system';
import { useTranslation } from '@acme/i18n';
import { useForgotPasswordForm } from '../hooks';
import { handleFormSubmit, getFieldError } from '@/lib/formUtils';

export function ForgotPasswordPage() {
  const { t } = useTranslation('auth');
  const { form, serverError, setServerError, isLoading, isSubmitted } = useForgotPasswordForm();

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md" data-testid="forgot-password-card">
        <CardHeader>
          <CardTitle>{t('forgotPassword.successTitle')}</CardTitle>
          <CardDescription>
            {t('forgotPassword.successDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground" data-testid="forgot-password-success">
            {t('forgotPassword.successMessage')}
          </p>
        </CardContent>
        <CardFooter>
          <a href="/login" className="text-sm text-primary hover:underline" data-testid="forgot-password-link-login">
            {t('forgotPassword.backToSignIn')}
          </a>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md" data-testid="forgot-password-card">
      <CardHeader>
        <CardTitle>{t('forgotPassword.title')}</CardTitle>
        <CardDescription>{t('forgotPassword.description')}</CardDescription>
      </CardHeader>
      <form onSubmit={handleFormSubmit(() => form.handleSubmit())} noValidate>
        <CardContent className="space-y-4">
          {serverError && <ErrorAlert data-testid="forgot-password-alert-error" message={serverError} onDismiss={() => setServerError(null)} />}

          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="forgot-email">{t('forgotPassword.emailLabel')}</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t('forgotPassword.placeholder.email')}
                  data-testid="forgot-password-input-email"
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive" data-testid="forgot-password-error-email">{getFieldError(field.state.meta.errors)}</p>
                )}
              </div>
            )}
          </form.Field>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading} data-testid="forgot-password-btn-submit">
            {isLoading ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
          </Button>
          <p className="text-sm text-muted-foreground">
            {t('forgotPassword.rememberPassword')}{' '}
            <a href="/login" className="text-primary hover:underline" data-testid="forgot-password-link-login">
              {t('forgotPassword.signIn')}
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
