import React from 'react';
import { Text, View } from 'react-native';
import { cn } from './utils/cn';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  testID?: string;
}

export function EmptyState({ title, description, action, className, testID }: EmptyStateProps) {
  return (
    <View
      className={cn('flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12', className)}
      testID={testID}
    >
      <Text className="text-lg font-semibold text-gray-900">{title}</Text>
      <Text className="text-center text-sm text-gray-500">{description}</Text>
      {action && <View className="mt-4">{action}</View>}
    </View>
  );
}
