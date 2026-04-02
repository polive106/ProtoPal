import React, { createContext, useContext, useCallback, useState } from 'react';
import {
  ToastProvider as RadixToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@acme/design-system';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

interface ToastContextValue {
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      <RadixToastProvider>
        {children}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            variant={toast.variant}
            onOpenChange={(open) => {
              if (!open) removeToast(toast.id);
            }}
          >
            <div className="grid gap-1">
              <ToastTitle>{toast.title}</ToastTitle>
              {toast.description && (
                <ToastDescription>{toast.description}</ToastDescription>
              )}
            </div>
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </RadixToastProvider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
