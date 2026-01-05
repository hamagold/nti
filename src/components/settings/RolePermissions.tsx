import { useState } from 'react';
import { Shield, Eye, UserPlus, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'sonner';

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

export type AdminRole = 'superadmin' | 'admin' | 'staff' | 'local_staff';

export interface RolePermissionConfig {
  role: AdminRole;
  name: string;
  icon: typeof Shield;
  description: string;
  permissions: Permission[];
}

const PERMISSION_LABELS: Record<Permission, string> = {
  view_dashboard: 'بینینی داشبۆرد',
  view_students: 'بینینی قوتابیان',
  view_staff: 'بینینی ستاف',
  view_payments: 'بینینی پارەدانەکان',
  view_expenses: 'بینینی خەرجیەکان',
  view_invoices: 'بینینی پسولەکان',
  view_reports: 'بینینی ڕاپۆرتەکان',
  view_settings: 'بینینی ڕێکخستنەکان',
  add_student: 'زیادکردنی قوتابی',
  edit_student: 'دەستکاری قوتابی',
  delete_student: 'سڕینەوەی قوتابی',
  add_staff: 'زیادکردنی ستاف',
  edit_staff: 'دەستکاری ستاف',
  delete_staff: 'سڕینەوەی ستاف',
  add_payment: 'زیادکردنی پارەدان',
  add_expense: 'زیادکردنی خەرجی',
  edit_expense: 'دەستکاری خەرجی',
  delete_expense: 'سڕینەوەی خەرجی',
  add_salary: 'پارەدانی مووچە',
  manage_departments: 'بەڕێوەبردنی بەشەکان',
  manage_admins: 'بەڕێوەبردنی ئەدمینەکان',
  manage_contact: 'بەڕێوەبردنی پەیوەندی',
  manage_notifications: 'بەڕێوەبردنی ئاگاداری',
  view_logs: 'بینینی لۆگەکان',
};

const PERMISSION_CATEGORIES = {
  viewing: {
    label: 'بینین',
    permissions: ['view_dashboard', 'view_students', 'view_staff', 'view_payments', 'view_expenses', 'view_invoices', 'view_reports', 'view_settings', 'view_logs'] as Permission[],
  },
  students: {
    label: 'قوتابیان',
    permissions: ['add_student', 'edit_student', 'delete_student', 'add_payment'] as Permission[],
  },
  staff: {
    label: 'ستاف',
    permissions: ['add_staff', 'edit_staff', 'delete_staff', 'add_salary'] as Permission[],
  },
  expenses: {
    label: 'خەرجیەکان',
    permissions: ['add_expense', 'edit_expense', 'delete_expense'] as Permission[],
  },
  settings: {
    label: 'ڕێکخستنەکان',
    permissions: ['manage_departments', 'manage_admins', 'manage_contact', 'manage_notifications'] as Permission[],
  },
};

// Default permissions for each role
const DEFAULT_ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  superadmin: Object.values(PERMISSION_LABELS).map((_, i) => Object.keys(PERMISSION_LABELS)[i]) as Permission[],
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
  staff: [
    'view_dashboard',
    'view_students',
    'add_student',
    'edit_student',
    'add_payment',
    'view_staff',
    'add_staff',
    'view_payments',
    'view_invoices',
  ],
  local_staff: [
    'add_student',
    'add_staff',
  ],
};

export function RolePermissions() {
  const { rolePermissions, updateRolePermissions, addActivityLog } = useSettingsStore();
  const [selectedRole, setSelectedRole] = useState<AdminRole>('staff');
  
  // Use stored permissions or defaults
  const currentPermissions = rolePermissions?.[selectedRole] || DEFAULT_ROLE_PERMISSIONS[selectedRole];
  
  const handleTogglePermission = (permission: Permission) => {
    const newPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];
    
    updateRolePermissions(selectedRole, newPermissions);
  };

  const handleResetToDefault = () => {
    updateRolePermissions(selectedRole, DEFAULT_ROLE_PERMISSIONS[selectedRole]);
    addActivityLog({
      type: 'settings',
      description: `گەڕاندنەوەی دەسەڵاتەکانی ${ROLE_INFO[selectedRole].name} بۆ بنچینەیی`,
      user: 'ئەدمین',
    });
    toast.success('دەسەڵاتەکان گەڕێنرانەوە بۆ بنچینەیی');
  };

  const ROLE_INFO: Record<AdminRole, { name: string; icon: typeof Shield; description: string }> = {
    superadmin: { name: 'سوپەر ئەدمین', icon: Shield, description: 'دەسەڵاتی تەواو - ناتوانرێت بگۆڕدرێت' },
    admin: { name: 'ئەدمین', icon: Eye, description: 'تەنها بینین - بێ دەستکاری' },
    staff: { name: 'ستاف', icon: UserPlus, description: 'کارمەندی ناوخۆ' },
    local_staff: { name: 'ستافی ناوخۆ', icon: UserPlus, description: 'تەنها تۆمارکردن' },
  };

  const isSuperAdmin = selectedRole === 'superadmin';

  return (
    <div className="space-y-6">
      {/* Role Selection */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(ROLE_INFO) as AdminRole[]).map((role) => {
          const info = ROLE_INFO[role];
          const Icon = info.icon;
          return (
            <Button
              key={role}
              variant={selectedRole === role ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRole(role)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {info.name}
            </Button>
          );
        })}
      </div>

      {/* Role Description */}
      <div className="p-4 rounded-xl bg-muted/50 border border-border">
        <p className="text-sm text-muted-foreground">
          {ROLE_INFO[selectedRole].description}
        </p>
      </div>

      {/* Permissions Grid */}
      {isSuperAdmin ? (
        <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 text-center">
          <Shield className="h-12 w-12 mx-auto mb-3 text-primary" />
          <p className="text-lg font-bold text-foreground">سوپەر ئەدمین دەسەڵاتی تەواوی هەیە</p>
          <p className="text-sm text-muted-foreground">ناتوانرێت دەسەڵاتەکانی بگۆڕدرێت</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(PERMISSION_CATEGORIES).map(([key, category]) => (
            <div key={key} className="space-y-3">
              <h4 className="font-bold text-foreground border-b border-border pb-2">
                {category.label}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {category.permissions.map((permission) => (
                  <div
                    key={permission}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <Label htmlFor={permission} className="cursor-pointer text-sm">
                      {PERMISSION_LABELS[permission]}
                    </Label>
                    <Switch
                      id={permission}
                      checked={currentPermissions.includes(permission)}
                      onCheckedChange={() => handleTogglePermission(permission)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button variant="outline" onClick={handleResetToDefault}>
              <RotateCcw className="h-4 w-4 ml-2" />
              گەڕانەوە بۆ بنچینەیی
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { DEFAULT_ROLE_PERMISSIONS, PERMISSION_LABELS };
