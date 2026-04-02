import React from 'react';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-white" testID="home-screen">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-3xl font-bold text-gray-900" testID="home-text-title">
          ProtoPal
        </Text>
        <Text className="mt-2 text-base text-gray-500" testID="home-text-subtitle">
          Welcome to ProtoPal Mobile
        </Text>
      </View>
    </View>
  );
}
