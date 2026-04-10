import React from 'react';
import { RegisterForm } from '@/features/auth/ui/RegisterForm';
import { AuthScreenWrapper } from './_layout';

export default function RegisterScreen() {
  return (
    <AuthScreenWrapper>
      <RegisterForm />
    </AuthScreenWrapper>
  );
}
