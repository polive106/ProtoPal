import React from 'react';
import { Pressable, Text, type PressableProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils/cn';

const buttonVariants = cva(
  'flex flex-row items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-blue-600',
        destructive: 'bg-red-600',
        outline: 'border border-gray-300 bg-white',
        secondary: 'bg-gray-200',
        ghost: '',
      },
      size: {
        default: 'h-12 px-4 py-2',
        sm: 'h-10 px-3',
        lg: 'h-14 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const buttonTextVariants = cva('text-sm font-medium', {
  variants: {
    variant: {
      default: 'text-white',
      destructive: 'text-white',
      outline: 'text-gray-900',
      secondary: 'text-gray-900',
      ghost: 'text-gray-900',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface ButtonProps
  extends Omit<PressableProps, 'children'>,
    VariantProps<typeof buttonVariants> {
  children: string;
  className?: string;
  textClassName?: string;
}

export function Button({
  children,
  variant,
  size,
  className,
  textClassName,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(
        buttonVariants({ variant, size }),
        disabled && 'opacity-50',
        className,
      )}
      disabled={disabled}
      {...props}
    >
      <Text className={cn(buttonTextVariants({ variant }), textClassName)}>
        {children}
      </Text>
    </Pressable>
  );
}

export { buttonVariants };
