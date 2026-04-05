import React from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@acme/design-system';
import { useVerifyEmail } from '../hooks';

interface VerifyEmailPageProps {
  token: string;
}

export function VerifyEmailPage({ token }: VerifyEmailPageProps) {
  const { data, isLoading, isError, error } = useVerifyEmail(token);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md" data-testid="verify-card">
        {isLoading ? (
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground" data-testid="verify-text-loading">
              Verifying your email...
            </p>
          </CardContent>
        ) : isError ? (
          <>
            <CardHeader>
              <CardTitle>Verification Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-sm text-destructive"
                data-testid="verify-alert-error"
              >
                {error?.message || 'Invalid or expired verification link.'}
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button asChild className="w-full">
                <a href="/register" data-testid="verify-link-register">
                  Register Again
                </a>
              </Button>
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <a
                  href="/login"
                  className="text-primary hover:underline"
                  data-testid="verify-link-login"
                >
                  Sign in
                </a>
              </p>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Email Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-sm text-muted-foreground"
                data-testid="verify-alert-success"
              >
                {data?.message || 'Your email has been verified. You can now sign in.'}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <a href="/login" data-testid="verify-link-login">
                  Sign In
                </a>
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
