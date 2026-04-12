import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { PageSpinner } from '@acme/design-system-mobile';
import { useTranslation } from '@acme/i18n';
import { useAuth } from '@/providers/AuthProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function AuthenticatedLayout() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const { t } = useTranslation('notes');
  const { t: tc } = useTranslation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <PageSpinner label={tc('loading')} />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#0f172a',
        headerTitleStyle: {
          fontFamily: 'Karla_700Bold',
          fontSize: 17,
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#f8f7f4' },
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{
          title: tc('appName'),
          headerTitleStyle: {
            fontFamily: 'SourceSerif4_600SemiBold',
            fontSize: 22,
          },
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <LanguageSwitcher />
              <Pressable onPress={() => logout()} hitSlop={8}>
                <Text style={{ fontFamily: 'Karla_500Medium', fontSize: 15, color: '#78716c' }}>
                  {tc('signOut')}
                </Text>
              </Pressable>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="notes/index"
        options={{
          title: t('pageTitle'),
        }}
      />
      <Stack.Screen
        name="notes/[noteId]"
        options={{
          title: '',
        }}
      />
      <Stack.Screen
        name="notes/form"
        options={{
          title: t('newNote'),
        }}
      />
    </Stack>
  );
}
