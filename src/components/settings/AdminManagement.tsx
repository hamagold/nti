import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X, Shield, Eye, UserPlus, Loader2 } from 'lucide-react';
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

type AppRole = 'superadmin' | 'admin' | 'user';

interface AdminUser {
  id: string;
  email: string;
  role: AppRole;
  created_at: string;
}

const ROLES: { id: AppRole; name: string; icon: typeof Shield; description: string }[] = [
  { id: 'superadmin', name: 'سوپەر ئەدمین', icon: Shield, description: 'دەسەڵاتی تەواو' },
  { id: 'admin', name: 'ئەدمین', icon: Eye, description: 'بینینی داتا' },
  { id: 'user', name: 'بەکارهێنەر', icon: UserPlus, description: 'دەسەڵاتی سنووردار' },
];

export function AdminManagement() {
  const { toast } = useToast();
  
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<AppRole>('user');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<AppRole>('user');
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch admins from user_roles and admin_profiles tables
  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Fetch admin profiles for emails
      const { data: profilesData } = await supabase
        .from('admin_profiles')
        .select('*');

      // Create a map of user_id to email
      const emailMap = new Map<string, string>();
      (profilesData || []).forEach((profile: any) => {
        emailMap.set(profile.user_id, profile.email);
      });

      const adminList: AdminUser[] = (rolesData || []).map(ur => ({
        id: ur.user_id,
        email: emailMap.get(ur.user_id) || 'ئیمەیڵ نەدۆزرایەوە',
        role: ur.role as AppRole,
        created_at: ur.created_at,
      }));

      setAdmins(adminList);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا ئەدمینەکان بهێنرێتەوە',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAdd = async () => {
    if (!newEmail.trim() || !newPassword.trim()) {
      toast({
        title: 'هەڵە',
        description: 'تکایە ئیمەیڵ و پاسۆرد بنووسە',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'هەڵە',
        description: 'پاسۆرد دەبێت لانیکەم ٦ پیت بێت',
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
        title: 'سەرکەوتوو بوو',
        description: `ئەدمینی "${newEmail.trim()}" زیادکرا`,
      });
      
      setIsAdding(false);
      setNewEmail('');
      setNewPassword('');
      setNewRole('user');
      fetchAdmins();
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: 'هەڵە',
        description: error.message || 'نەتوانرا ئەدمین زیاد بکرێت',
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
      const { error } = await supabase
        .from('user_roles')
        .update({ role: editRole })
        .eq('user_id', editingId);

      if (error) throw error;
      
      toast({
        title: 'نوێکرایەوە',
        description: 'ڕۆڵی ئەدمین گۆڕدرا',
      });
      
      setEditingId(null);
      fetchAdmins();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: 'هەڵە',
        description: error.message || 'نەتوانرا ڕۆڵ نوێ بکرێتەوە',
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
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', deletingId);

      if (error) throw error;
      
      toast({
        title: 'سڕایەوە',
        description: 'ئەدمین سڕایەوە',
      });
      
      setDeleteConfirmOpen(false);
      setDeletingId(null);
      fetchAdmins();
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      toast({
        title: 'هەڵە',
        description: error.message || 'نەتوانرا ئەدمین بسڕدرێتەوە',
        variant: 'destructive',
      });
    }
  };

  const getRoleInfo = (role: string) => {
    return ROLES.find((r) => r.id === role) || ROLES[2];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">بەڕێوەبردنی ئەدمین</h3>
        {!isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 ml-2" />
            زیادکردن
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-4 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>ئیمەیڵ</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="admin@example.com"
                dir="ltr"
              />
            </div>
            <div>
              <Label>پاسۆرد</Label>
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
            <Label>ڕۆڵ</Label>
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
                      <span>{role.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({role.description})
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
              هەڵوەشاندنەوە
            </Button>
            <Button onClick={handleAdd} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 ml-2" />
              )}
              زیادکردن
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {admins.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            هیچ ئەدمینێک نەدۆزرایەوە
          </p>
        ) : (
          admins.map((admin) => {
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
                      <Label className="text-xs">ڕۆڵ</Label>
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
                                <span>{role.name}</span>
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
                            پاشەکەوت
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
                            admin.role === 'user'
                              ? 'text-muted-foreground'
                              : 'text-primary-foreground'
                          )}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm" dir="ltr">{admin.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {roleInfo.name} - {roleInfo.description}
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

      <PasswordConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDelete}
        title="سڕینەوەی ئەدمین"
        description="دڵنیایت لە سڕینەوەی ئەم ئەدمینە؟"
      />
    </div>
  );
}
