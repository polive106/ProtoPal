import '../global.css';

import React from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ToastProvider } from '@acme/design-system-mobile';
import { QueryProvider } from '@/providers/QueryProvider';

export default function RootLayout() {
  return (
    <QueryProvider>
      <ToastProvider>
        <StatusBar style="auto" />
        <Slot />
      </ToastProvider>
    </QueryProvider>
  );
}
