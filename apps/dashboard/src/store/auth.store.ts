import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, tenantId: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenantId: null,
      isAuthenticated: false,

      setAuth: (user, tenantId) =>
        set({ user, tenantId, isAuthenticated: true }),

      clearAuth: () =>
        set({ user: null, tenantId: null, isAuthenticated: false }),
    }),
    {
      name: 'autonova-auth',
      // Only persist non-sensitive UI data — tokens live in httpOnly cookies
      partialize: (state) => ({
        user: state.user,
        tenantId: state.tenantId,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
