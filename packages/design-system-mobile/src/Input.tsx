import React, { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { cn } from './utils/cn';

export interface InputProps extends TextInputProps {
  className?: string;
  invalid?: boolean;
}

export function Input({ className, invalid, onFocus, onBlur, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      className={cn(
        'h-12 w-full rounded-xl border bg-white px-4 text-base text-ink',
        focused ? 'border-brand' : 'border-warmBorder',
        invalid && 'border-red-500',
        props.editable === false && 'opacity-50',
        className,
      )}
      placeholderTextColor="#a8a29e"
      style={{ fontFamily: 'Karla_400Regular' }}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...props}
    />
  );
}
