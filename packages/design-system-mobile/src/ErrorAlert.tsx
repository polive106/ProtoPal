import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { cn } from './utils/cn';

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
  testID?: string;
}

export function ErrorAlert({ message, onDismiss, className, testID }: ErrorAlertProps) {
  return (
    <View
      className={cn('rounded-md border border-red-200 bg-red-50 p-4', className)}
      accessibilityRole="alert"
      testID={testID}
    >
      <View className="flex flex-row items-start">
        <View className="flex-1">
          <Text className="text-sm text-red-800">{message}</Text>
        </View>
        {onDismiss && (
          <Pressable
            onPress={onDismiss}
            className="ml-3 rounded-md p-1.5"
            testID={testID ? `${testID}-dismiss` : undefined}
          >
            <Text className="text-red-500">✕</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
