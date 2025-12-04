/**
 * Authentication Context
 * Provides user authentication state and methods throughout the app
 */
import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { resolveApiUrl } from '@/lib/api';
import type { User } from '@shared/schema';

// ============================================
// TYPES
// ============================================

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, teamId?: string) => Promise<void>;
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER COMPONENT
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      const response = await fetch(resolveApiUrl('/api/auth/me'), {
        credentials: 'include',
      });
      if (response.status === 401) {
        return null;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      const userData = await response.json();
      console.log('🔄 AuthContext - User data received:', userData);
      console.log('🔄 AuthContext - Avatar URL:', userData?.avatarUrl);
      return userData;
    },
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const user = await apiRequest('POST', '/api/auth/login', { email, password });
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/auth/logout', {});
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
      queryClient.clear();
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async ({ name, email, password, teamId }: { name: string; email: string; password: string; teamId?: string }) => {
      return await apiRequest('POST', '/api/auth/register', { name, email, password, teamId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });

  // Auth methods
  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const register = async (name: string, email: string, password: string, teamId?: string) => {
    await registerMutation.mutateAsync({ name, email, password, teamId });
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

