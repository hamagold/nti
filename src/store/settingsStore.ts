import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Department, DepartmentInfo } from '@/types';

export type AdminRole = 'superadmin' | 'admin' | 'staff' | 'local_staff';

export type Permission = 
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

export interface Admin {
  id: string;
  username: string;
  password: string;
  role: AdminRole;
  createdAt: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  website?: string;
}

export interface ActivityLog {
  id: string;
  type: 'payment' | 'student_add' | 'student_delete' | 'staff_add' | 'staff_delete' | 'salary' | 'expense' | 'settings' | 'year_progress';
  description: string;
  amount?: number;
  timestamp: string;
  user: string;
}

// All permissions list
const ALL_PERMISSIONS: Permission[] = [
  'view_dashboard', 'view_students', 'view_staff', 'view_payments', 'view_expenses',
  'view_invoices', 'view_reports', 'view_settings', 'add_student', 'edit_student',
  'delete_student', 'add_staff', 'edit_staff', 'delete_staff', 'add_payment',
  'add_expense', 'edit_expense', 'delete_expense', 'add_salary', 'manage_departments',
  'manage_admins', 'manage_contact', 'manage_notifications', 'view_logs',
];

// Default permissions for each role
const DEFAULT_ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  superadmin: ALL_PERMISSIONS,
  admin: [
    'view_dashboard', 'view_students', 'view_staff', 'view_payments', 'view_expenses',
    'view_invoices', 'view_reports', 'view_settings', 'view_logs',
  ],
  staff: [
    'view_dashboard', 'view_students', 'add_student', 'edit_student', 'add_payment',
    'view_staff', 'add_staff', 'view_payments', 'view_invoices',
  ],
  local_staff: [
    'add_student', 'add_staff',
  ],
};

interface SettingsState {
  departments: DepartmentInfo[];
  admins: Admin[];
  contactInfo: ContactInfo;
  activityLog: ActivityLog[];
  notificationDays: number;
  rolePermissions: Record<AdminRole, Permission[]>;
  
  // Actions
  updateDepartment: (id: Department, updates: Partial<DepartmentInfo>) => void;
  addDepartment: (dept: DepartmentInfo) => void;
  deleteDepartment: (id: Department) => void;
  
  addAdmin: (admin: Omit<Admin, 'id' | 'createdAt'>) => void;
  updateAdmin: (id: string, updates: Partial<Admin>) => void;
  deleteAdmin: (id: string) => void;
  
  updateContactInfo: (info: Partial<ContactInfo>) => void;
  
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  clearActivityLog: () => void;
  
  setNotificationDays: (days: number) => void;
  
  updateRolePermissions: (role: AdminRole, permissions: Permission[]) => void;
  getRolePermissions: (role: AdminRole) => Permission[];
}

const DEFAULT_DEPARTMENTS: DepartmentInfo[] = [
  { id: 'computer', name: 'کۆمپیوتەر', icon: '💻', yearlyFee: 1800000, color: 'primary' },
  { id: 'patrol', name: 'پەترۆل', icon: '⛽', yearlyFee: 2000000, color: 'secondary' },
  { id: 'accounting', name: 'ژمێریاری', icon: '📊', yearlyFee: 1600000, color: 'accent' },
  { id: 'administrator', name: 'کارگێڕی', icon: '🏢', yearlyFee: 1700000, color: 'info' },
];

const DEFAULT_ADMIN: Admin = {
  id: 'admin-1',
  username: 'adminNTI',
  password: 'kurdistan',
  role: 'superadmin',
  createdAt: new Date().toISOString(),
};

const DEFAULT_CONTACT: ContactInfo = {
  email: 'info@nti.edu.krd',
  phone: '+964 750 123 4567',
  location: 'سلێمانی، کوردستان',
  website: 'www.nti.edu.krd',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      departments: DEFAULT_DEPARTMENTS,
      admins: [DEFAULT_ADMIN],
      contactInfo: DEFAULT_CONTACT,
      activityLog: [],
      notificationDays: 50,
      rolePermissions: DEFAULT_ROLE_PERMISSIONS,

      updateDepartment: (id, updates) => {
        set({
          departments: get().departments.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        });
      },

      addDepartment: (dept) => {
        set({ departments: [...get().departments, dept] });
      },

      deleteDepartment: (id) => {
        set({
          departments: get().departments.filter((d) => d.id !== id),
        });
      },

      addAdmin: (admin) => {
        const newAdmin: Admin = {
          ...admin,
          id: `admin-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set({ admins: [...get().admins, newAdmin] });
      },

      updateAdmin: (id, updates) => {
        set({
          admins: get().admins.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        });
      },

      deleteAdmin: (id) => {
        // Don't allow deleting last admin
        if (get().admins.length <= 1) return;
        set({
          admins: get().admins.filter((a) => a.id !== id),
        });
      },

      updateContactInfo: (info) => {
        set({
          contactInfo: { ...get().contactInfo, ...info },
        });
      },

      addActivityLog: (log) => {
        const newLog: ActivityLog = {
          ...log,
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        // Keep only last 100 logs
        const logs = [newLog, ...get().activityLog].slice(0, 100);
        set({ activityLog: logs });
      },

      clearActivityLog: () => {
        set({ activityLog: [] });
      },

      setNotificationDays: (days) => {
        set({ notificationDays: days });
      },

      updateRolePermissions: (role, permissions) => {
        if (role === 'superadmin') return; // Can't modify superadmin
        set({
          rolePermissions: {
            ...get().rolePermissions,
            [role]: permissions,
          },
        });
      },

      getRolePermissions: (role) => {
        return get().rolePermissions[role] || DEFAULT_ROLE_PERMISSIONS[role];
      },
    }),
    {
      name: 'settings-storage',
    }
  )
);

export { DEFAULT_ROLE_PERMISSIONS };

