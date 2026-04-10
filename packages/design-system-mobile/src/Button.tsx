import React from 'react';
import { Pressable, Text, ActivityIndicator, type PressableProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils/cn';

const buttonVariants = cva(
  'flex flex-row items-center justify-center',
  {
    variants: {
      variant: {
        default: 'bg-brand rounded-full',
        destructive: 'bg-danger rounded-full',
        outline: 'border border-warmBorder bg-surface-card rounded-full',
        secondary: 'bg-stone-100 rounded-full',
        ghost: 'rounded-xl',
      },
      size: {
        default: 'h-12 px-6 py-2',
        sm: 'h-10 px-4',
        lg: 'h-14 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const buttonTextVariants = cva('font-medium', {
  variants: {
    variant: {
      default: 'text-white',
      destructive: 'text-white',
      outline: 'text-ink',
      secondary: 'text-ink',
      ghost: 'text-ink',
    },
    size: {
      default: 'text-sm',
      sm: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export interface ButtonProps
  extends Omit<PressableProps, 'children'>,
    VariantProps<typeof buttonVariants> {
  children: string;
  className?: string;
  textClassName?: string;
  loading?: boolean;
}

export function Button({
  children,
  variant,
  size,
  className,
  textClassName,
  disabled,
  loading,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={cn(
        buttonVariants({ variant, size }),
        isDisabled && 'opacity-50',
        'active:opacity-90',
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' || variant === 'secondary' ? '#0f172a' : '#ffffff'}
        />
      ) : (
        <Text
          className={cn(buttonTextVariants({ variant, size }), textClassName)}
          style={{ fontFamily: 'Karla_500Medium' }}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

export { buttonVariants };
