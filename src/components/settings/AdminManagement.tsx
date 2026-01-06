import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Pencil, Trash2, Save, X, Shield, Eye, UserPlus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PasswordConfirmDialog } from '@/components/common/PasswordConfirmDialog';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';

type AppRole = 'superadmin' | 'admin' | 'staff' | 'local_staff';

interface AdminUser {
  id: string;
  email: string;
  role: AppRole;
  created_at: string;
}

const ROLES: { id: AppRole; name: string; icon: typeof Shield; description: string }[] = [
  { id: 'superadmin', name: 'سوپەر ئەدمین', icon: Shield, description: 'دەسەڵاتی تەواو' },
  { id: 'admin', name: 'ئەدمین', icon: Eye, description: 'بینینی داتا' },
  { id: 'staff', name: 'ستاف', icon: UserPlus, description: 'کارمەندی ناوخۆ' },
  { id: 'local_staff', name: 'ستافی ناوخۆ', icon: UserPlus, description: 'تەنها تۆمارکردن' },
];

const ITEMS_PER_PAGE = 5;

export function AdminManagement() {
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<AppRole>('staff');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<AppRole>('staff');
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch admins from user_roles and admin_profiles tables - optimized with parallel fetching
  const fetchAdmins = useCallback(async (showLoader = true) => {
    if (showLoader && isInitialLoad) {
      setIsLoading(true);
    }
    try {
      // Fetch both tables in parallel for better performance
      const [rolesResult, profilesResult] = await Promise.all([
        supabase
          .from('user_roles')
          .select('user_id, role, created_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('admin_profiles')
          .select('user_id, email')
      ]);

      if (rolesResult.error) throw rolesResult.error;

      // Create a map of user_id to email
      const emailMap = new Map<string, string>();
      (profilesResult.data || []).forEach((profile) => {
        emailMap.set(profile.user_id, profile.email);
      });

      const adminList: AdminUser[] = (rolesResult.data || []).map(ur => ({
        id: ur.user_id,
        email: emailMap.get(ur.user_id) || 'ئیمەیڵ نەدۆزرایەوە',
        role: ur.role as AppRole,
        created_at: ur.created_at,
      }));

      setAdmins(adminList);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        title: t('adminMgmt.error'),
        description: t('adminMgmt.fetchError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [toast, isInitialLoad]);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAdd = async () => {
    if (!newEmail.trim() || !newPassword.trim()) {
      toast({
        title: t('adminMgmt.error'),
        description: t('adminMgmt.fillEmailPassword'),
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: t('adminMgmt.error'),
        description: t('adminMgmt.passwordMinLength'),
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: {
          email: newEmail.trim(),
          password: newPassword.trim(),
          role: newRole,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: t('adminMgmt.success'),
        description: `${t('adminMgmt.adminAdded')}: ${newEmail.trim()}`,
      });
      
      setIsAdding(false);
      setNewEmail('');
      setNewPassword('');
      setNewRole('staff');
      fetchAdmins(false);
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: t('adminMgmt.error'),
        description: error.message || t('adminMgmt.addError'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (admin: AdminUser) => {
    setEditingId(admin.id);
    setEditRole(admin.role);
  };

  const saveEdit = async () => {
    if (!editingId) return;

    setIsSaving(true);
    try {
      // Ensure the user has ONLY ONE role row
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', editingId);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: editingId, role: editRole });

      if (insertError) throw insertError;

      toast({
        title: t('adminMgmt.updated'),
        description: t('adminMgmt.roleChanged'),
      });

      setEditingId(null);
      fetchAdmins(false);
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: t('adminMgmt.error'),
        description: error.message || t('adminMgmt.updateError'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      // Delete from database AND disable login (deletes the auth user)
      const { data, error } = await supabase.functions.invoke('delete-admin', {
        body: { user_id: deletingId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: t('adminMgmt.deleted'),
        description: t('adminMgmt.adminDeleted'),
      });

      setDeleteConfirmOpen(false);
      setDeletingId(null);
      fetchAdmins(false);
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      toast({
        title: t('adminMgmt.error'),
        description: error.message || t('adminMgmt.deleteError'),
        variant: 'destructive',
      });
    }
  };

  const getRoleInfo = (role: string) => {
    const r = ROLES.find((r) => r.id === role) || ROLES[2];
    return {
      ...r,
      name: t(`rolePermissions.${r.id}`),
    };
  };

  // Pagination calculations
  const totalPages = Math.ceil(admins.length / ITEMS_PER_PAGE);
  const paginatedAdmins = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return admins.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [admins, currentPage]);

  // Reset to page 1 when admins change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [admins.length, totalPages, currentPage]);

  // Skeleton loading for better UX
  const AdminSkeleton = useMemo(() => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-xl border bg-muted/50 border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  ), []);

  if (isLoading && isInitialLoad) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">{t('adminMgmt.title')}</h3>
          <Skeleton className="h-9 w-24" />
        </div>
        {AdminSkeleton}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">{t('adminMgmt.title')}</h3>
        {!isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 ml-2" />
            {t('adminMgmt.add')}
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-4 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('adminMgmt.email')}</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="admin@example.com"
                dir="ltr"
              />
            </div>
            <div>
              <Label>{t('adminMgmt.password')}</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          </div>
          <div>
            <Label>{t('adminMgmt.role')}</Label>
            <Select
              value={newRole}
              onValueChange={(v) => setNewRole(v as AppRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      <role.icon className="h-4 w-4" />
                      <span>{t(`rolePermissions.${role.id}`)}</span>
                      <span className="text-xs text-muted-foreground">
                        ({t(`rolePermissions.${role.id}Desc`)})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsAdding(false)} disabled={isSaving}>
              <X className="h-4 w-4 ml-2" />
              {t('adminMgmt.cancel')}
            </Button>
            <Button onClick={handleAdd} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 ml-2" />
              )}
              {t('adminMgmt.add')}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {admins.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t('adminMgmt.noAdmins')}
          </p>
        ) : (
          paginatedAdmins.map((admin) => {
            const roleInfo = getRoleInfo(admin.role);
            const RoleIcon = roleInfo.icon;
            
            return (
              <div
                key={admin.id}
                className={cn(
                  'p-4 rounded-xl border transition-colors',
                  admin.role === 'superadmin'
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-muted/50 border-border'
                )}
              >
                {editingId === admin.id ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">{t('adminMgmt.role')}</Label>
                      <Select
                        value={editRole}
                        onValueChange={(v) => setEditRole(v as AppRole)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              <div className="flex items-center gap-2">
                                <role.icon className="h-4 w-4" />
                                <span>{t(`rolePermissions.${role.id}`)}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(null)}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={saveEdit} disabled={isSaving}>
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="h-4 w-4 ml-1" />
                            {t('adminMgmt.save')}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'h-10 w-10 rounded-full flex items-center justify-center',
                          admin.role === 'superadmin'
                            ? 'gradient-primary'
                            : admin.role === 'admin'
                            ? 'gradient-secondary'
                            : 'bg-muted'
                        )}
                      >
                        <RoleIcon
                          className={cn(
                            'h-5 w-5',
                            admin.role === 'local_staff'
                              ? 'text-muted-foreground'
                              : 'text-primary-foreground'
                          )}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm" dir="ltr">{admin.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {roleInfo.name} - {t(`rolePermissions.${admin.role}Desc`)}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          {new Date(admin.created_at).toLocaleDateString('ckb-IQ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => startEdit(admin)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {admins.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => confirmDelete(admin.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {admins.length} {t('adminMgmt.adminsCount')} - {t('adminMgmt.page')} {currentPage} {t('adminMgmt.of')} {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <PasswordConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDelete}
        title={t('messages.confirmDelete')}
        description={t('messages.confirmDelete')}
      />
    </div>
  );
}
