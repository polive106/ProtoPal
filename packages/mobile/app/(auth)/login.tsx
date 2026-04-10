import React from 'react';
import { LoginForm } from '@/features/auth/ui/LoginForm';
import { AuthScreenWrapper } from './_layout';

export default function LoginScreen() {
  return (
    <AuthScreenWrapper>
      <LoginForm />
    </AuthScreenWrapper>
  );
}
