import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  username: string;
  password: string;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateCredentials: (username: string, password: string) => void;
}

const DEFAULT_USERNAME = 'adminNTI';
const DEFAULT_PASSWORD = 'kurdistan';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      username: DEFAULT_USERNAME,
      password: DEFAULT_PASSWORD,
      
      login: (username: string, password: string) => {
        const state = get();
        if (username === state.username && password === state.password) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },
      
      logout: () => set({ isAuthenticated: false }),
      
      updateCredentials: (username: string, password: string) => {
        set({ username, password });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);