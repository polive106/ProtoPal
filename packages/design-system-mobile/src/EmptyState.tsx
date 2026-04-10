import React from 'react';
import { Text, View } from 'react-native';
import { cn } from './utils/cn';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  testID?: string;
}

export function EmptyState({ title, description, icon, action, className, testID }: EmptyStateProps) {
  return (
    <View
      className={cn('flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12', className)}
      testID={testID}
    >
      {icon && <View className="mb-2">{icon}</View>}
      <Text
        className="text-lg text-ink"
        style={{ fontFamily: 'Karla_700Bold' }}
      >
        {title}
      </Text>
      <Text
        className="text-center text-sm text-ink-muted"
        style={{ fontFamily: 'Karla_400Regular' }}
      >
        {description}
      </Text>
      {action && <View className="mt-4">{action}</View>}
    </View>
  );
}
