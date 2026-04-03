import '../global.css';

import React from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ToastProvider } from '@acme/design-system-mobile';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';

export default function RootLayout() {
  return (
    <QueryProvider>
      <AuthProvider>
        <ToastProvider>
          <StatusBar style="auto" />
          <Slot />
        </ToastProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
