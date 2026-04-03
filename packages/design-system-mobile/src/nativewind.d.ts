/// <reference types="nativewind/types" />

// NativeWind className augmentation for React Native 0.83+
// RN 0.83 changed the type structure, so we need explicit augmentation
import 'react-native';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface PressableProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
}
