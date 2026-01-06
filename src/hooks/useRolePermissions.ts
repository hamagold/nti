import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Permission, AdminRole, DEFAULT_ROLE_PERMISSIONS } from '@/store/settingsStore';

interface RolePermissionsData {
  role: string;
  permissions: string[];
}

export function useRolePermissions() {
  const [rolePermissions, setRolePermissions] = useState<Record<AdminRole, Permission[]>>(DEFAULT_ROLE_PERMISSIONS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('role, permissions');

      if (error) throw error;

      if (data && data.length > 0) {
        const permissionsMap: Record<string, Permission[]> = {};
        data.forEach((item: RolePermissionsData) => {
          permissionsMap[item.role] = item.permissions as Permission[];
        });
        
        setRolePermissions({
          superadmin: permissionsMap['superadmin'] || DEFAULT_ROLE_PERMISSIONS.superadmin,
          admin: permissionsMap['admin'] || DEFAULT_ROLE_PERMISSIONS.admin,
          staff: permissionsMap['staff'] || DEFAULT_ROLE_PERMISSIONS.staff,
          local_staff: permissionsMap['local_staff'] || DEFAULT_ROLE_PERMISSIONS.local_staff,
        });
      }
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      // Fall back to defaults
      setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePermissions = useCallback(async (role: AdminRole, permissions: Permission[]): Promise<boolean> => {
    if (role === 'superadmin') return false; // Can't modify superadmin

    try {
      // UPDATE first
      const { data: updated, error: updateError } = await supabase
        .from('role_permissions')
        .update({ permissions, updated_at: new Date().toISOString() })
        .eq('role', role)
        .select('role');

      if (updateError) throw updateError;

      // If the row doesn't exist (0 rows updated), INSERT it.
      if (!updated || updated.length === 0) {
        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert({ role, permissions });

        if (insertError) throw insertError;
      }

      // Update local state immediately
      setRolePermissions(prev => ({
        ...prev,
        [role]: permissions,
      }));

      return true;
    } catch (error) {
      console.error('Error updating role permissions:', error);
      return false;
    }
  }, []);

  const resetToDefaults = useCallback(async (role: AdminRole): Promise<boolean> => {
    if (role === 'superadmin') return false;
    
    const defaultPerms = DEFAULT_ROLE_PERMISSIONS[role];
    return updatePermissions(role, defaultPerms);
  }, [updatePermissions]);

  const getPermissions = useCallback((role: AdminRole): Permission[] => {
    return rolePermissions[role] || DEFAULT_ROLE_PERMISSIONS[role];
  }, [rolePermissions]);

  useEffect(() => {
    fetchPermissions();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('role_permissions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'role_permissions',
        },
        () => {
          fetchPermissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPermissions]);

  return {
    rolePermissions,
    isLoading,
    updatePermissions,
    resetToDefaults,
    getPermissions,
    refetch: fetchPermissions,
  };
}
