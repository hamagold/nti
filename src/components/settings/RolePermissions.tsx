import { useState } from 'react';
import { Shield, Eye, UserPlus, RotateCcw, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Permission, AdminRole, DEFAULT_ROLE_PERMISSIONS } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { toast } from 'sonner';

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

const ROLE_INFO: Record<AdminRole, { name: string; icon: typeof Shield; description: string }> = {
  superadmin: { name: 'سوپەر ئەدمین', icon: Shield, description: 'دەسەڵاتی تەواو - ناتوانرێت بگۆڕدرێت' },
  admin: { name: 'ئەدمین', icon: Eye, description: 'تەنها بینین - بێ دەستکاری' },
  staff: { name: 'ستاف', icon: UserPlus, description: 'کارمەندی ناوخۆ' },
  local_staff: { name: 'ستافی ناوخۆ', icon: UserPlus, description: 'تەنها تۆمارکردن' },
};

export function RolePermissions() {
  const { rolePermissions, updatePermissions, resetToDefaults, isLoading } = useRolePermissions();
  const { currentRole: userRole } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<AdminRole>('staff');
  const [isSaving, setIsSaving] = useState(false);
  
  const isSuperAdminUser = userRole === 'superadmin';
  
  // Use stored permissions or defaults
  const currentPermissions = rolePermissions?.[selectedRole] || DEFAULT_ROLE_PERMISSIONS[selectedRole];
  
  const handleTogglePermission = async (permission: Permission) => {
    if (!isSuperAdminUser) {
      toast.error('تەنها سوپەر ئەدمین دەتوانێت دەسەڵات بگۆڕێت');
      return;
    }
    
    setIsSaving(true);
    const isRemoving = currentPermissions.includes(permission);
    const newPermissions = isRemoving
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];
    
    const success = await updatePermissions(selectedRole, newPermissions);
    setIsSaving(false);
    
    if (success) {
      toast.success(
        isRemoving 
          ? `${PERMISSION_LABELS[permission]} لابرا لە ${ROLE_INFO[selectedRole].name}`
          : `${PERMISSION_LABELS[permission]} زیادکرا بۆ ${ROLE_INFO[selectedRole].name}`
      );
    } else {
      toast.error('نەتوانرا دەسەڵات نوێ بکرێتەوە');
    }
  };

  const handleResetToDefault = async () => {
    if (!isSuperAdminUser) {
      toast.error('تەنها سوپەر ئەدمین دەتوانێت دەسەڵات بگۆڕێت');
      return;
    }
    
    setIsSaving(true);
    const success = await resetToDefaults(selectedRole);
    setIsSaving(false);
    
    if (success) {
      toast.success('دەسەڵاتەکان گەڕێنرانەوە بۆ بنچینەیی');
    } else {
      toast.error('نەتوانرا دەسەڵاتەکان بگەڕێنرێتەوە');
    }
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

      {/* Non-superadmin warning */}
      {!isSuperAdminUser && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
          <Lock className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">
            تەنها سوپەر ئەدمین دەتوانێت دەسەڵاتەکان بگۆڕێت
          </p>
        </div>
      )}

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
                    className={`flex items-center justify-between p-3 rounded-lg bg-muted/30 transition-colors ${isSuperAdminUser && !isSaving ? 'hover:bg-muted/50' : 'opacity-60'}`}
                  >
                    <Label htmlFor={permission} className={`text-sm ${isSuperAdminUser && !isSaving ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                      {PERMISSION_LABELS[permission]}
                    </Label>
                    <Switch
                      id={permission}
                      checked={currentPermissions.includes(permission)}
                      onCheckedChange={() => handleTogglePermission(permission)}
                      disabled={!isSuperAdminUser || isSaving || isLoading}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Actions */}
          {isSuperAdminUser && (
            <div className="flex gap-2 justify-end pt-4 border-t border-border">
              <Button variant="outline" onClick={handleResetToDefault} disabled={isSaving || isLoading}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4 ml-2" />
                )}
                گەڕانەوە بۆ بنچینەیی
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { PERMISSION_LABELS };
export type { Permission, AdminRole };
