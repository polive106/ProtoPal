import React from 'react';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, ErrorAlert } from '@acme/design-system';
import { useTranslation } from '@acme/i18n';
import { useRegistrationForm } from '../hooks';
import { handleFormSubmit, getFieldError } from '@/lib/formUtils';

export function RegisterForm() {
  const { t } = useTranslation('auth');
  const { form, serverError, setServerError, isLoading } = useRegistrationForm();

  return (
    <Card className="w-full max-w-md" data-testid="register-card">
      <CardHeader>
        <CardTitle>{t('register.title')}</CardTitle>
        <CardDescription>{t('register.description')}</CardDescription>
      </CardHeader>
      <form onSubmit={handleFormSubmit(() => form.handleSubmit())} noValidate>
        <CardContent className="space-y-4">
          {serverError && <ErrorAlert data-testid="register-alert-error" message={serverError} onDismiss={() => setServerError(null)} />}
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="firstName">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('register.firstNameLabel')}</Label>
                  <Input
                    id="firstName"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    data-testid="register-input-firstName"
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive" data-testid="register-error-firstName">{getFieldError(field.state.meta.errors)}</p>
                  )}
                </div>
              )}
            </form.Field>
            <form.Field name="lastName">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('register.lastNameLabel')}</Label>
                  <Input
                    id="lastName"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    data-testid="register-input-lastName"
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive" data-testid="register-error-lastName">{getFieldError(field.state.meta.errors)}</p>
                  )}
                </div>
              )}
            </form.Field>
          </div>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="email">{t('register.emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  data-testid="register-input-email"
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive" data-testid="register-error-email">{getFieldError(field.state.meta.errors)}</p>
                )}
              </div>
            )}
          </form.Field>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="password">{t('register.passwordLabel')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  data-testid="register-input-password"
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive" data-testid="register-error-password">{getFieldError(field.state.meta.errors)}</p>
                )}
                <p className="text-xs text-muted-foreground">{t('register.passwordHint')}</p>
              </div>
            )}
          </form.Field>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading} data-testid="register-btn-submit">
            {isLoading ? t('register.submitting') : t('register.submit')}
          </Button>
          <p className="text-sm text-muted-foreground">
            {t('register.hasAccount')}{' '}
            <a href="/login" className="text-primary hover:underline" data-testid="register-link-login">
              {t('register.signIn')}
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
