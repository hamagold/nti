import { useAuthStore } from '@/store/authStore';

type Permission = 
  | 'view_dashboard'
  | 'view_students'
  | 'view_staff'
  | 'view_payments'
  | 'view_expenses'
  | 'view_invoices'
  | 'view_reports'
  | 'view_settings'
  | 'add_student'
  | 'edit_student'
  | 'delete_student'
  | 'add_staff'
  | 'edit_staff'
  | 'delete_staff'
  | 'add_payment'
  | 'add_expense'
  | 'edit_expense'
  | 'delete_expense'
  | 'add_salary'
  | 'manage_departments'
  | 'manage_admins'
  | 'manage_contact'
  | 'manage_notifications'
  | 'view_logs';

// Role permissions mapping
const ROLE_PERMISSIONS: Record<'superadmin' | 'admin' | 'editor', Permission[]> = {
  // Super Admin: Full access to everything
  superadmin: [
    'view_dashboard',
    'view_students',
    'view_staff',
    'view_payments',
    'view_expenses',
    'view_invoices',
    'view_reports',
    'view_settings',
    'add_student',
    'edit_student',
    'delete_student',
    'add_staff',
    'edit_staff',
    'delete_staff',
    'add_payment',
    'add_expense',
    'edit_expense',
    'delete_expense',
    'add_salary',
    'manage_departments',
    'manage_admins',
    'manage_contact',
    'manage_notifications',
    'view_logs',
  ],
  
  // Admin: View only - no editing
  admin: [
    'view_dashboard',
    'view_students',
    'view_staff',
    'view_payments',
    'view_expenses',
    'view_invoices',
    'view_reports',
    'view_settings',
    'view_logs',
  ],
  
  // Editor: Only register students and staff - no viewing other data
  editor: [
    'add_student',
    'add_staff',
  ],
};

export function usePermissions() {
  const { currentRole, isAuthenticated } = useAuthStore();

  const hasPermission = (permission: Permission): boolean => {
    if (!isAuthenticated || !currentRole) return false;
    return ROLE_PERMISSIONS[currentRole]?.includes(permission) ?? false;
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

  const isSuperAdmin = currentRole === 'superadmin';
  const isAdmin = currentRole === 'admin';
  const isEditor = currentRole === 'editor';

  return {
    hasPermission,
    canView,
    canAdd,
    canEdit,
    canDelete,
    canManage,
    isSuperAdmin,
    isAdmin,
    isEditor,
    currentRole,
  };
}
