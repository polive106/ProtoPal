import React from 'react';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, ErrorAlert } from '@acme/design-system';
import { useResetPasswordForm } from '../hooks';
import { handleFormSubmit, getFieldError } from '@/lib/formUtils';

interface ResetPasswordPageProps {
  token: string;
}

export function ResetPasswordPage({ token }: ResetPasswordPageProps) {
  const { form, serverError, setServerError, isLoading, isSuccess } = useResetPasswordForm(token);

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md" data-testid="reset-password-card">
        <CardHeader>
          <CardTitle>Password Reset</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground" data-testid="reset-password-success">
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
        </CardContent>
        <CardFooter>
          <a href="/login" className="text-primary hover:underline" data-testid="reset-password-link-login">
            Sign In
          </a>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md" data-testid="reset-password-card">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Enter your new password</CardDescription>
      </CardHeader>
      <form onSubmit={handleFormSubmit(() => form.handleSubmit())} noValidate>
        <CardContent className="space-y-4">
          {serverError && <ErrorAlert data-testid="reset-password-alert-error" message={serverError} onDismiss={() => setServerError(null)} />}

          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  data-testid="reset-password-input-password"
                />
                <p className="text-xs text-muted-foreground">
                  Min 8 chars, uppercase, lowercase, and number
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
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
