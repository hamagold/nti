import { useAuthStore } from '@/store/authStore';
import { useSettingsStore, Permission, AdminRole, DEFAULT_ROLE_PERMISSIONS } from '@/store/settingsStore';

export function usePermissions() {
  const { currentRole, isAuthenticated } = useAuthStore();
  const { getRolePermissions } = useSettingsStore();

  const hasPermission = (permission: Permission): boolean => {
    if (!isAuthenticated || !currentRole) return false;
    
    // Use the store's getter function which handles both stored and default permissions
    const permissions = getRolePermissions(currentRole);
    return permissions?.includes(permission) ?? false;
  };

  const canView = (page: 'dashboard' | 'students' | 'staff' | 'payments' | 'expenses' | 'invoices' | 'reports' | 'settings'): boolean => {
    return hasPermission(`view_${page}` as Permission);
  };

  const canAdd = (entity: 'student' | 'staff' | 'payment' | 'expense' | 'salary'): boolean => {
    return hasPermission(`add_${entity}` as Permission);
  };

  const canEdit = (entity: 'student' | 'staff' | 'expense'): boolean => {
    return hasPermission(`edit_${entity}` as Permission);
  };

  const canDelete = (entity: 'student' | 'staff' | 'expense'): boolean => {
    return hasPermission(`delete_${entity}` as Permission);
  };

  const canManage = (setting: 'departments' | 'admins' | 'contact' | 'notifications'): boolean => {
    return hasPermission(`manage_${setting}` as Permission);
  };

  const canViewLogs = (): boolean => {
    return hasPermission('view_logs');
  };

  const isSuperAdmin = currentRole === 'superadmin';
  const isAdmin = currentRole === 'admin';
  const isStaff = currentRole === 'staff';
  const isLocalStaff = currentRole === 'local_staff';

  return {
    hasPermission,
    canView,
    canAdd,
    canEdit,
    canDelete,
    canManage,
    canViewLogs,
    isSuperAdmin,
    isAdmin,
    isStaff,
    isLocalStaff,
    currentRole,
  };
}
