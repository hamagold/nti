import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { useSettingsStore, AdminRole } from './settingsStore';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  isAuthenticated: boolean;
  currentUser: string | null;
  currentRole: AdminRole | null;
  supabaseUser: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setSession: (session: Session | null) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      currentUser: null,
      currentRole: null,
      supabaseUser: null,
      session: null,
      isLoading: true,
      
      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('Login error:', error);
          return false;
        }
        
        if (data.user && data.session) {
          set({ 
            isAuthenticated: true, 
            currentUser: data.user.email,
            currentRole: 'superadmin', // Default role for authenticated users
            supabaseUser: data.user,
            session: data.session,
          });
          return true;
        }
        return false;
      },
      
      signup: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) {
          console.error('Signup error:', error);
          return { success: false, error: error.message };
        }
        
        if (data.user && data.session) {
          set({ 
            isAuthenticated: true, 
            currentUser: data.user.email,
            currentRole: 'superadmin',
            supabaseUser: data.user,
            session: data.session,
          });
          return { success: true };
        }
        
        return { success: true };
      },
      
      logout: async () => {
        await supabase.auth.signOut();
        set({ 
          isAuthenticated: false, 
          currentUser: null, 
          currentRole: null,
          supabaseUser: null,
          session: null,
        });
      },
      
      setSession: (session: Session | null) => {
        if (session) {
          set({
            isAuthenticated: true,
            currentUser: session.user.email,
            currentRole: 'superadmin',
            supabaseUser: session.user,
            session,
            isLoading: false,
          });
        } else {
          set({
            isAuthenticated: false,
            currentUser: null,
            currentRole: null,
            supabaseUser: null,
            session: null,
            isLoading: false,
          });
        }
      },
      
      initialize: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        get().setSession(session);
        
        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
          get().setSession(session);
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist minimal data, session is managed by Supabase
      }),
    }
  )
);
