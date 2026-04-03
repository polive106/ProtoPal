import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { cn } from './utils/cn';

type ToastVariant = 'default' | 'destructive' | 'success';

interface ToastMessage {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (opts: { title: string; description?: string; variant?: ToastVariant }) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const variantClasses: Record<ToastVariant, string> = {
  default: 'border-gray-200 bg-white',
  destructive: 'border-red-500 bg-red-50',
  success: 'border-green-500 bg-green-50',
};

const variantTextClasses: Record<ToastVariant, string> = {
  default: 'text-gray-900',
  destructive: 'text-red-900',
  success: 'text-green-900',
};

function ToastItem({ message, onDismiss }: { message: ToastMessage; onDismiss: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => onDismiss());
    }, 3000);

    return () => clearTimeout(timer);
  }, [opacity, onDismiss]);

  return (
    <Animated.View
      style={{ opacity }}
      className={cn(
        'mb-2 rounded-md border p-4 shadow-lg',
        variantClasses[message.variant],
      )}
    >
      <Pressable onPress={onDismiss} className="flex flex-row items-start justify-between">
        <View className="flex-1">
          <Text className={cn('text-sm font-semibold', variantTextClasses[message.variant])}>
            {message.title}
          </Text>
          {message.description && (
            <Text className={cn('mt-1 text-sm', variantTextClasses[message.variant])}>
              {message.description}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const nextId = useRef(0);

  const toast = useCallback(
    (opts: { title: string; description?: string; variant?: ToastVariant }) => {
      const id = nextId.current++;
      setMessages((prev) => [...prev, { id, variant: 'default', ...opts }]);
    },
    [],
  );

  const dismiss = useCallback((id: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <View className="absolute bottom-10 left-4 right-4" pointerEvents="box-none">
        {messages.map((msg) => (
          <ToastItem key={msg.id} message={msg} onDismiss={() => dismiss(msg.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}
