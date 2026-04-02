import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { cn } from './utils/cn';

interface PageSpinnerProps {
  label?: string;
  className?: string;
}

export function PageSpinner({ label = 'Loading...', className }: PageSpinnerProps) {
  return (
    <View className={cn('flex flex-1 flex-col items-center justify-center gap-3', className)}>
      <ActivityIndicator size="large" color="#2563eb" />
      {label && <Text className="text-sm text-gray-500">{label}</Text>}
    </View>
  );
}
