import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { PageSpinner } from '@acme/design-system-mobile';
import { useAuth } from '@/providers/AuthProvider';

export default function AuthenticatedLayout() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <PageSpinner label="Loading..." />;
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
          title: 'ProtoPal',
          headerTitleStyle: {
            fontFamily: 'SourceSerif4_600SemiBold',
            fontSize: 22,
          },
          headerRight: () => (
            <Pressable onPress={() => logout()} hitSlop={8}>
              <Text style={{ fontFamily: 'Karla_500Medium', fontSize: 15, color: '#78716c' }}>
                Sign Out
              </Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="notes/index"
        options={{
          title: 'My Notes',
        }}
      />
      <Stack.Screen
        name="notes/[noteId]"
        options={{
          title: 'Note',
        }}
      />
      <Stack.Screen
        name="notes/form"
        options={{
          title: 'New Note',
        }}
      />
    </Stack>
  );
}
