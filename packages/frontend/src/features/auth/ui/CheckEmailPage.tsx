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
import { useResendVerification } from '../hooks';

interface CheckEmailPageProps {
  email: string;
}

export function CheckEmailPage({ email }: CheckEmailPageProps) {
  const resendMutation = useResendVerification();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md" data-testid="check-email-card">
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            We sent a verification link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {resendMutation.isError && (
            <ErrorAlert
              data-testid="check-email-alert-error"
              message={resendMutation.error?.message || 'Failed to resend email'}
              onDismiss={() => resendMutation.reset()}
            />
          )}
          <p className="text-sm text-muted-foreground" data-testid="check-email-text-message">
            Click the link in the email to verify your account. If you don't see
            the email, check your spam folder or request a new one.
          </p>
          {resendMutation.isSuccess && (
            <p className="text-sm text-green-600" data-testid="check-email-text-resent">
              Verification email resent successfully.
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
            {resendMutation.isPending ? 'Sending...' : 'Resend Verification Email'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already verified?{' '}
            <a
              href="/login"
              className="text-primary hover:underline"
              data-testid="check-email-link-login"
            >
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
