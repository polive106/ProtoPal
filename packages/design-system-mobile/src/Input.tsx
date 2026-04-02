import React from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { cn } from './utils/cn';

export interface InputProps extends TextInputProps {
  className?: string;
  invalid?: boolean;
}

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <TextInput
      className={cn(
        'h-12 w-full rounded-md border border-gray-300 bg-white px-3 text-base text-gray-900',
        'placeholder:text-gray-400',
        invalid && 'border-red-500',
        props.editable === false && 'opacity-50',
        className,
      )}
      placeholderTextColor="#9ca3af"
      {...props}
    />
  );
}
