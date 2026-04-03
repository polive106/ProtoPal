import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '@acme/design-system-mobile';
import { useAuth } from '@/providers/AuthProvider';

export default function DashboardScreen() {
  const { user, logout } = useAuth();

  return (
    <View testID="dashboard-screen" className="flex-1 px-4 pt-8">
      <Text
        testID="dashboard-text-welcome"
        className="text-2xl font-bold text-gray-900"
      >
        Welcome, {user?.firstName}!
      </Text>
      <Text className="mt-2 text-gray-500">
        You're logged in to ProtoPal.
      </Text>

      <View className="mt-8">
        <Button
          testID="dashboard-btn-logout"
          variant="outline"
          onPress={() => logout()}
        >
          Sign Out
        </Button>
      </View>
    </View>
  );
}
