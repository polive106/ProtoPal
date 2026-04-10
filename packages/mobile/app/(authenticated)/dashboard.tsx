import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@acme/design-system-mobile';
import { useAuth } from '@/providers/AuthProvider';

function UserAvatar({ firstName, lastName }: { firstName?: string; lastName?: string }) {
  const initials = `${(firstName?.[0] ?? '').toUpperCase()}${(lastName?.[0] ?? '').toUpperCase()}`;
  return (
    <View className="h-14 w-14 items-center justify-center rounded-full bg-brand">
      <Text
        className="text-xl text-white"
        style={{ fontFamily: 'Karla_700Bold' }}
      >
        {initials}
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <View testID="dashboard-screen" className="flex-1 px-5 pt-8">
      <View className="flex-row items-center gap-4 mb-10">
        <UserAvatar firstName={user?.firstName} lastName={user?.lastName} />
        <View>
          <Text
            className="text-sm text-ink-muted"
            style={{ fontFamily: 'Karla_400Regular' }}
          >
            Welcome back,
          </Text>
          <Text
            testID="dashboard-text-welcome"
            className="text-2xl text-ink"
            style={{ fontFamily: 'SourceSerif4_600SemiBold' }}
          >
            {user?.firstName}
          </Text>
        </View>
      </View>

      <View className="gap-4">
        <Pressable
          testID="dashboard-btn-notes"
          onPress={() => router.push('/(authenticated)/notes')}
          className="active:opacity-90"
        >
          <Card className="bg-brand/5">
            <View className="flex-row items-center justify-between p-5">
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">📓</Text>
                <View>
                  <Text
                    className="text-base text-ink"
                    style={{ fontFamily: 'Karla_700Bold' }}
                  >
                    My Notes
                  </Text>
                  <Text
                    className="mt-0.5 text-sm text-ink-muted"
                    style={{ fontFamily: 'Karla_400Regular' }}
                  >
                    View and manage your notes
                  </Text>
                </View>
              </View>
              <Text className="text-lg text-ink-light">→</Text>
            </View>
          </Card>
        </Pressable>
      </View>
    </View>
  );
}
