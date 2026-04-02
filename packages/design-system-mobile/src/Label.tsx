import React from 'react';
import { Text, type TextProps } from 'react-native';
import { cn } from './utils/cn';

export interface LabelProps extends TextProps {
  className?: string;
}

export function Label({ className, ...props }: LabelProps) {
  return (
    <Text
      className={cn('text-sm font-medium text-gray-900', className)}
      {...props}
    />
  );
}
