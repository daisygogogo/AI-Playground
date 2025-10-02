import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setToken: (token) => {
        localStorage.setItem('authToken', token);
        set({ token });
      },
      setLoading: (isLoading) => set({ isLoading }),
      
      logout: () => {
        localStorage.removeItem('authToken');
        set({ user: null, token: null });
      },

      isAuthenticated: () => {
        // Calculate authentication status based on token and user state in store
        const { token, user } = get();
        return !!(token && user);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
    }
  )
);
