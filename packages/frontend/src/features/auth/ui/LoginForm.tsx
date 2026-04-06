import React from 'react';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, ErrorAlert } from '@acme/design-system';
import { useLoginForm } from '../hooks';
import { handleFormSubmit, getFieldError } from '@/lib/formUtils';

export function LoginForm() {
  const { form, serverError, setServerError, isPending } = useLoginForm();

  return (
    <Card className="w-full max-w-md" data-testid="login-card">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleFormSubmit(() => form.handleSubmit())} noValidate>
        <CardContent className="space-y-4">
          {serverError && <ErrorAlert data-testid="login-alert-error" message={serverError} onDismiss={() => setServerError(null)} />}

          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="you@example.com"
                  data-testid="login-input-email"
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive" data-testid="login-error-email">{getFieldError(field.state.meta.errors)}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  data-testid="login-input-password"
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive" data-testid="login-error-password">{getFieldError(field.state.meta.errors)}</p>
                )}
              </div>
            )}
          </form.Field>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending} data-testid="login-btn-submit">
            {isPending ? 'Signing in...' : 'Sign In'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <a href="/register" className="text-primary hover:underline" data-testid="login-link-register">
              Sign up
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
