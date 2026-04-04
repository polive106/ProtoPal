import React, { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';
import { cn } from './utils/cn';

interface SkeletonProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const style: ViewStyle = {};
  if (width !== undefined) style.width = width as number;
  if (height !== undefined) style.height = height as number;

  return (
    <Animated.View
      className={cn('rounded-md bg-gray-200', className)}
      style={[style, { opacity }]}
    />
  );
}
