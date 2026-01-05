import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { useSettingsStore, AdminRole } from './settingsStore';
import { User, Session } from '@supabase/supabase-js';

type AppRole = 'superadmin' | 'admin' | 'user' | 'staff' | 'local_staff';

interface AuthState {
  isAuthenticated: boolean;
  currentUser: string | null;
  currentRole: AdminRole | null;
  appRole: AppRole | null;
  supabaseUser: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setSession: (session: Session | null) => void;
  initialize: () => Promise<void>;
  fetchUserRole: (userId: string) => Promise<AppRole | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      currentUser: null,
      currentRole: null,
      appRole: null,
      supabaseUser: null,
      session: null,
      isLoading: true,
      
      fetchUserRole: async (userId: string): Promise<AppRole | null> => {
        try {
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .single();
          
          if (error || !data) {
            return null;
          }
          
          return data.role as AppRole;
        } catch {
          return null;
        }
      },
      
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
          const role = await get().fetchUserRole(data.user.id);
          // Map app role to AdminRole
          const adminRole = role === 'superadmin' ? 'superadmin' 
            : role === 'admin' ? 'admin' 
            : role === 'staff' ? 'staff'
            : role === 'local_staff' ? 'local_staff'
            : 'staff';
          set({ 
            isAuthenticated: true, 
            currentUser: data.user.email,
            currentRole: adminRole as AdminRole,
            appRole: role || 'user',
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
            appRole: 'user',
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
          appRole: null,
          supabaseUser: null,
          session: null,
        });
      },
      
      setSession: async (session: Session | null) => {
        if (session) {
          const role = await get().fetchUserRole(session.user.id);
          // Map app role to AdminRole
          const adminRole = role === 'superadmin' ? 'superadmin' 
            : role === 'admin' ? 'admin' 
            : role === 'staff' ? 'staff'
            : role === 'local_staff' ? 'local_staff'
            : 'staff';
          set({
            isAuthenticated: true,
            currentUser: session.user.email,
            currentRole: adminRole as AdminRole,
            appRole: role || 'user',
            supabaseUser: session.user,
            session,
            isLoading: false,
          });
        } else {
          set({
            isAuthenticated: false,
            currentUser: null,
            currentRole: null,
            appRole: null,
            supabaseUser: null,
            session: null,
            isLoading: false,
          });
        }
      },
      
      initialize: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        await get().setSession(session);
        
        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (_event, session) => {
          await get().setSession(session);
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
