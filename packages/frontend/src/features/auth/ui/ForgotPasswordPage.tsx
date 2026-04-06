import React from 'react';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, ErrorAlert } from '@acme/design-system';
import { useForgotPasswordForm } from '../hooks';
import { handleFormSubmit, getFieldError } from '@/lib/formUtils';

export function ForgotPasswordPage() {
  const { form, serverError, setServerError, isLoading, isSubmitted } = useForgotPasswordForm();

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md" data-testid="forgot-password-card">
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            If an account with that email exists, we've sent a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground" data-testid="forgot-password-success">
            The link will expire in 1 hour. Check your spam folder if you don't see it.
          </p>
        </CardContent>
        <CardFooter>
          <a href="/login" className="text-sm text-primary hover:underline" data-testid="forgot-password-link-login">
            Back to Sign In
          </a>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md" data-testid="forgot-password-card">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>Enter your email and we'll send you a reset link</CardDescription>
      </CardHeader>
      <form onSubmit={handleFormSubmit(() => form.handleSubmit())} noValidate>
        <CardContent className="space-y-4">
          {serverError && <ErrorAlert data-testid="forgot-password-alert-error" message={serverError} onDismiss={() => setServerError(null)} />}

          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="you@example.com"
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
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Remember your password?{' '}
            <a href="/login" className="text-primary hover:underline" data-testid="forgot-password-link-login">
              Sign in
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
