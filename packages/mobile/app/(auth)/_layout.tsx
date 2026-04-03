import React from 'react';
import { Slot } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthLayout() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center px-4">
        <Slot />
      </View>
    </SafeAreaView>
  );
}
