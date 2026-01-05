import { useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, Shield, Eye, UserPlus } from 'lucide-react';
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
import { useSettingsStore, Admin, AdminRole } from '@/store/settingsStore';
import { useToast } from '@/hooks/use-toast';
import { PasswordConfirmDialog } from '@/components/common/PasswordConfirmDialog';
import { cn } from '@/lib/utils';

const ROLES: { id: AdminRole; name: string; icon: typeof Shield; description: string }[] = [
  { id: 'superadmin', name: 'سوپەر ئەدمین', icon: Shield, description: 'دەسەڵاتی تەواو' },
  { id: 'admin', name: 'ئەدمین', icon: Eye, description: 'تەنها بینینی داتا' },
  { id: 'staff', name: 'ستاف', icon: UserPlus, description: 'کارمەندی ناوخۆ' },
  { id: 'local_staff', name: 'ستافی ناوخۆ', icon: UserPlus, description: 'تەنها تۆمارکردن' },
];

export function AdminManagement() {
  const { admins, addAdmin, updateAdmin, deleteAdmin, addActivityLog } = useSettingsStore();
  const { toast } = useToast();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('local_staff');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<AdminRole>('local_staff');
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      toast({
        title: 'هەڵە',
        description: 'تکایە ناوی بەکارهێنەر و پاسۆرد بنووسە',
        variant: 'destructive',
      });
      return;
    }

    // Check if username already exists
    if (admins.some(a => a.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      toast({
        title: 'هەڵە',
        description: 'ئەم ناوی بەکارهێنەرە پێشتر بەکارهاتووە',
        variant: 'destructive',
      });
      return;
    }

    addAdmin({
      username: newUsername.trim(),
      password: newPassword.trim(),
      role: newRole,
    });
    
    addActivityLog({
      type: 'settings',
      description: `زیادکردنی ئەدمینی نوێ: ${newUsername.trim()}`,
      user: 'ئەدمین',
    });
    
    toast({
      title: 'سەرکەوتوو بوو',
      description: `ئەدمینی "${newUsername.trim()}" زیادکرا`,
    });
    
    setIsAdding(false);
    setNewUsername('');
    setNewPassword('');
    setNewRole('local_staff');
  };

  const startEdit = (admin: Admin) => {
    setEditingId(admin.id);
    setEditUsername(admin.username);
    setEditPassword(admin.password);
    setEditRole(admin.role);
  };

  const saveEdit = () => {
    if (!editingId) return;
    
    updateAdmin(editingId, {
      username: editUsername.trim(),
      password: editPassword.trim(),
      role: editRole,
    });
    
    addActivityLog({
      type: 'settings',
      description: `نوێکردنەوەی ئەدمین: ${editUsername.trim()}`,
      user: 'ئەدمین',
    });
    
    toast({
      title: 'نوێکرایەوە',
      description: 'زانیاریەکان پاشەکەوتکران',
    });
    
    setEditingId(null);
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (!deletingId) return;
    
    const admin = admins.find((a) => a.id === deletingId);
    deleteAdmin(deletingId);
    
    addActivityLog({
      type: 'settings',
      description: `سڕینەوەی ئەدمین: ${admin?.username}`,
      user: 'ئەدمین',
    });
    
    toast({
      title: 'سڕایەوە',
      description: 'ئەدمین سڕایەوە',
    });
    
    setDeleteConfirmOpen(false);
    setDeletingId(null);
  };

  const getRoleInfo = (role: string) => {
    return ROLES.find((r) => r.id === role) || ROLES[2];
  };

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
              <Label>ناوی بەکارهێنەر</Label>
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="username"
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
              onValueChange={(v) => setNewRole(v as AdminRole)}
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
            <Button variant="outline" onClick={() => setIsAdding(false)}>
              <X className="h-4 w-4 ml-2" />
              هەڵوەشاندنەوە
            </Button>
            <Button onClick={handleAdd}>
              <Save className="h-4 w-4 ml-2" />
              زیادکردن
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {admins.map((admin) => {
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">ناوی بەکارهێنەر</Label>
                      <Input
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">پاسۆرد</Label>
                      <Input
                        type="password"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">ڕۆڵ</Label>
                    <Select
                      value={editRole}
                      onValueChange={(v) => setEditRole(v as AdminRole)}
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
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={saveEdit}>
                      <Save className="h-4 w-4 ml-1" />
                      پاشەکەوت
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
                          : admin.role === 'staff' || admin.role === 'local_staff'
                          ? 'gradient-secondary'
                          : 'bg-muted'
                      )}
                    >
                      <RoleIcon
                        className={cn(
                          'h-5 w-5',
                          admin.role === 'admin'
                            ? 'text-muted-foreground'
                            : 'text-primary-foreground'
                        )}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{admin.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {roleInfo.name} - {roleInfo.description}
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
        })}
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
