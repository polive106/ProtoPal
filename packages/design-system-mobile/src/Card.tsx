import React from 'react';
import { View, Text, type ViewProps, type TextProps } from 'react-native';
import { cn } from './utils/cn';

export interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className, ...props }: CardProps) {
  return (
    <View
      className={cn('rounded-2xl border border-warmBorder bg-surface-card overflow-hidden', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return <View className={cn('flex flex-col gap-1.5 p-5', className)} {...props} />;
}

export interface CardTextProps extends TextProps {
  className?: string;
}

export function CardTitle({ className, ...props }: CardTextProps) {
  return (
    <Text
      className={cn('text-xl text-ink', className)}
      style={{ fontFamily: 'Karla_700Bold' }}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: CardTextProps) {
  return (
    <Text
      className={cn('text-sm text-ink-muted', className)}
      style={{ fontFamily: 'Karla_400Regular' }}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: CardProps) {
  return <View className={cn('px-5 pb-1', className)} {...props} />;
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <View
      className={cn('flex flex-row items-center p-5 pt-3', className)}
      {...props}
    />
  );
}
