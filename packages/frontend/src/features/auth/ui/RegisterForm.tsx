import React from 'react';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, ErrorAlert } from '@acme/design-system';
import { useRegistrationForm } from '../hooks';
import { handleFormSubmit, getFieldError } from '@/lib/formUtils';

export function RegisterForm() {
  const { form, serverError, setServerError, isLoading } = useRegistrationForm();

  return (
    <Card className="w-full max-w-md" data-testid="register-card">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Sign up for a new account</CardDescription>
      </CardHeader>
      <form onSubmit={handleFormSubmit(() => form.handleSubmit())} noValidate>
        <CardContent className="space-y-4">
          {serverError && <ErrorAlert data-testid="register-alert-error" message={serverError} onDismiss={() => setServerError(null)} />}
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="firstName">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    data-testid="register-input-firstName"
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">{getFieldError(field.state.meta.errors)}</p>
                  )}
                </div>
              )}
            </form.Field>
            <form.Field name="lastName">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    data-testid="register-input-lastName"
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">{getFieldError(field.state.meta.errors)}</p>
                  )}
                </div>
              )}
            </form.Field>
          </div>
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
                  data-testid="register-input-email"
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">{getFieldError(field.state.meta.errors)}</p>
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
                  data-testid="register-input-password"
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">{getFieldError(field.state.meta.errors)}</p>
                )}
                <p className="text-xs text-muted-foreground">Min 8 chars, uppercase, lowercase, and number</p>
              </div>
            )}
          </form.Field>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading} data-testid="register-btn-submit">
            {isLoading ? 'Creating...' : 'Create Account'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:underline" data-testid="register-link-login">
              Sign in
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
