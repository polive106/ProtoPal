import React from 'react';
import { View, Text, type ViewProps, type TextProps } from 'react-native';
import { cn } from './utils/cn';

export interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className, ...props }: CardProps) {
  return (
    <View
      className={cn('rounded-lg border border-gray-200 bg-white shadow-sm', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return <View className={cn('flex flex-col gap-1.5 p-4', className)} {...props} />;
}

export interface CardTextProps extends TextProps {
  className?: string;
}

export function CardTitle({ className, ...props }: CardTextProps) {
  return (
    <Text
      className={cn('text-xl font-semibold text-gray-900', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: CardTextProps) {
  return (
    <Text className={cn('text-sm text-gray-500', className)} {...props} />
  );
}

export function CardContent({ className, ...props }: CardProps) {
  return <View className={cn('p-4 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <View
      className={cn('flex flex-row items-center p-4 pt-0', className)}
      {...props}
    />
  );
}
