import { useState } from 'react';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettingsStore, type ActivityLog } from '@/store/settingsStore';
import { formatCurrency, Department } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { PasswordConfirmDialog } from '@/components/common/PasswordConfirmDialog';

export function DepartmentManagement() {
  const { departments, updateDepartment, addDepartment, deleteDepartment, addActivityLog } = useSettingsStore();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<Department | null>(null);
  const [editName, setEditName] = useState('');
  const [editFee, setEditFee] = useState('');
  const [editIcon, setEditIcon] = useState('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newId, setNewId] = useState('');
  const [newFee, setNewFee] = useState('');
  const [newIcon, setNewIcon] = useState('📚');
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<Department | null>(null);

  const startEdit = (id: Department) => {
    const dept = departments.find((d) => d.id === id);
    if (dept) {
      setEditingId(id);
      setEditName(dept.name);
      setEditFee(dept.yearlyFee.toString());
      setEditIcon(dept.icon);
    }
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateDepartment(editingId, {
      name: editName,
      yearlyFee: parseInt(editFee) || 0,
      icon: editIcon,
    });
    addActivityLog({
      type: 'settings',
      description: `دەستکاری بەشی ${editName}`,
      user: 'ئەدمین',
    });
    toast({
      title: 'نوێکرایەوە',
      description: 'بەشەکە بە سەرکەوتوویی نوێکرایەوە',
    });
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!newName || !newId || !newFee) {
      toast({
        title: 'هەڵە',
        description: 'تکایە هەموو خانەکان پڕبکەوە',
        variant: 'destructive',
      });
      return;
    }

    addDepartment({
      id: newId as Department,
      name: newName,
      yearlyFee: parseInt(newFee) || 0,
      icon: newIcon,
      color: 'primary',
    });
    
    addActivityLog({
      type: 'settings',
      description: `زیادکردنی بەشی ${newName}`,
      user: 'ئەدمین',
    });
    
    toast({
      title: 'زیادکرا',
      description: 'بەشی نوێ زیادکرا',
    });
    
    setIsAdding(false);
    setNewName('');
    setNewId('');
    setNewFee('');
    setNewIcon('📚');
  };

  const confirmDelete = (id: Department) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (!deletingId) return;
    const dept = departments.find((d) => d.id === deletingId);
    deleteDepartment(deletingId);
    addActivityLog({
      type: 'settings',
      description: `سڕینەوەی بەشی ${dept?.name}`,
      user: 'ئەدمین',
    });
    toast({
      title: 'سڕایەوە',
      description: 'بەشەکە سڕایەوە',
    });
    setDeleteConfirmOpen(false);
    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">بەشەکان و کرێی سالانە</h3>
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
              <Label>ناوی بەش</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="ناوی بەش"
              />
            </div>
            <div>
              <Label>ئایکۆن</Label>
              <Input
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                placeholder="📚"
                className="text-2xl"
              />
            </div>
            <div>
              <Label>ID (ئینگلیزی)</Label>
              <Input
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                placeholder="department_id"
                dir="ltr"
              />
            </div>
            <div>
              <Label>کرێی سالانە (دینار)</Label>
              <Input
                type="number"
                value={newFee}
                onChange={(e) => setNewFee(e.target.value)}
                placeholder="1800000"
              />
            </div>
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

      <div className="grid gap-4 sm:grid-cols-2">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="p-4 rounded-xl bg-muted/50 border border-border"
          >
            {editingId === dept.id ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                    className="w-16 text-2xl text-center"
                  />
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">کرێی سالانە (دینار)</Label>
                  <Input
                    type="number"
                    value={editFee}
                    onChange={(e) => setEditFee(e.target.value)}
                  />
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
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{dept.icon}</span>
                    <div>
                      <p className="font-bold text-foreground">{dept.name}</p>
                      <p className="text-xs text-muted-foreground">{dept.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEdit(dept.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => confirmDelete(dept.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">کرێی سالانە:</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(dept.yearlyFee)}
                  </p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <PasswordConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDelete}
        title="سڕینەوەی بەش"
        description="دڵنیایت لە سڕینەوەی ئەم بەشە؟"
      />
    </div>
  );
}
