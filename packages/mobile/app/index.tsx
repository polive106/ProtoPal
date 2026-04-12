import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { PageSpinner } from '@acme/design-system-mobile';
import { useTranslation } from '@acme/i18n';
import { useAuth } from '@/providers/AuthProvider';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(authenticated)/dashboard');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return <PageSpinner label={t('loading')} />;
}
