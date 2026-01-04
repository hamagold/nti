import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSettingsStore } from './settingsStore';

interface AuthState {
  isAuthenticated: boolean;
  currentUser: string | null;
  currentRole: 'admin' | 'manager' | 'viewer' | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      currentUser: null,
      currentRole: null,
      
      login: (username: string, password: string) => {
        // Get admins from settings store
        const { admins } = useSettingsStore.getState();
        
        // Find matching admin
        const admin = admins.find(
          a => a.username === username && a.password === password
        );
        
        if (admin) {
          set({ 
            isAuthenticated: true, 
            currentUser: admin.username,
            currentRole: admin.role 
          });
          return true;
        }
        return false;
      },
      
      logout: () => set({ 
        isAuthenticated: false, 
        currentUser: null, 
        currentRole: null 
      }),
    }),
    {
      name: 'auth-storage',
    }
  )
);