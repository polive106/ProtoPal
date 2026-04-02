import React, { createContext, useContext } from 'react';
import { useCurrentUser, useLogin, useLogout } from '@/features/auth';
import type { AuthUser } from '@/features/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const hasRole = (role: string) => user?.roles.some((r) => r.roleName === role) ?? false;
  const isAdmin = hasRole('admin');

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasRole,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
