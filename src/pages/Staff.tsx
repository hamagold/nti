import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { useStore } from '@/store/useStore';
import { Staff as StaffType, formatCurrency, DEPARTMENTS, Department, MONTHS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Users, Trash2, Edit, GraduationCap, Briefcase, Banknote } from 'lucide-react';
import { StaffSalaryDialog } from '@/components/staff/StaffSalaryDialog';
import { PasswordConfirmDialog } from '@/components/common/PasswordConfirmDialog';

export default function Staff() {
  const { staff, addStaff, updateStaff, deleteStaff } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<StaffType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [salaryStaff, setSalaryStaff] = useState<StaffType | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: '' as 'teacher' | 'employee',
    department: '' as Department | '',
    salary: '',
  });

  const teachers = staff.filter((s) => s.role === 'teacher');
  const employees = staff.filter((s) => s.role === 'employee');
  const totalSalaries = staff.reduce((sum, s) => sum + s.salary, 0);
  
  const currentYear = new Date().getFullYear();
  const totalPaidThisYear = staff.reduce((sum, s) => {
    const payments = s.salaryPayments || [];
    return sum + payments.filter(p => p.year === currentYear).reduce((pSum, p) => pSum + p.amount, 0);
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.role || !formData.salary) {
      toast.error('تکایە هەموو خانەکان پڕبکەوە');
      return;
    }

    const staffData = {
      name: formData.name,
      phone: formData.phone,
      role: formData.role,
      department: formData.department as Department | undefined,
      salary: parseFloat(formData.salary),
      joinDate: new Date().toISOString(),
    };

    if (editStaff) {
      updateStaff(editStaff.id, staffData);
      toast.success('زانیاری ستاف نوێکرایەوە');
    } else {
      addStaff({
        id: crypto.randomUUID(),
        ...staffData,
        salaryPayments: [],
      });
      toast.success('ستاف بە سەرکەوتوویی زیاد کرا');
    }

    setFormOpen(false);
    resetForm();
  };

  const handleEdit = (member: StaffType) => {
    setEditStaff(member);
    setFormData({
      name: member.name,
      phone: member.phone,
      role: member.role,
      department: member.department || '',
      salary: member.salary.toString(),
    });
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteStaff(deleteId);
      toast.success('ستاف سڕایەوە');
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setEditStaff(null);
    setFormData({
      name: '',
      phone: '',
      role: '' as 'teacher' | 'employee',
      department: '',
      salary: '',
    });
  };

  const getPaidMonthsCount = (member: StaffType) => {
    const payments = member.salaryPayments || [];
    return payments.filter(p => p.year === currentYear).length;
  };

  return (
    <div className="min-h-screen pb-8">
      <Header
        title="ستاف"
        subtitle="بەڕێوەبردنی مامۆستا و کارمەندەکان"
      />

      <div className="p-8">
        {/* Stats */}
        <div className="grid gap-6 mb-8 md:grid-cols-4">
          <div className="rounded-2xl bg-card p-6 shadow-lg animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">مامۆستاکان</p>
                <p className="text-2xl font-bold text-foreground">{teachers.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-lg animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl gradient-secondary flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">کارمەندەکان</p>
                <p className="text-2xl font-bold text-foreground">{employees.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-lg animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center">
                <Users className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">کۆی مووچەی مانگانە</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalSalaries)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-lg animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center">
                <Banknote className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">دراوە لەم ساڵە</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(totalPaidThisYear)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Button */}
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => {
              resetForm();
              setFormOpen(true);
            }}
            className="gradient-primary text-primary-foreground"
          >
            <Plus className="h-5 w-5 ml-2" />
            ستافی نوێ
          </Button>
        </div>

        {/* Staff Grid */}
        {staff.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">هیچ ستافێک تۆمار نەکراوە</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {staff.map((member, index) => {
              const paidMonths = getPaidMonthsCount(member);
              
              return (
                <div
                  key={member.id}
                  className="rounded-2xl bg-card p-6 shadow-lg animate-slide-up cursor-pointer hover:shadow-xl transition-shadow"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSalaryStaff(member)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        {member.role === 'teacher' ? (
                          <GraduationCap className="h-6 w-6 text-primary" />
                        ) : (
                          <Briefcase className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{member.name}</p>
                        <Badge variant={member.role === 'teacher' ? 'default' : 'secondary'}>
                          {member.role === 'teacher' ? 'مامۆستا' : 'کارمەند'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(member)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ژمارەی مۆبایل:</span>
                      <span>{member.phone}</span>
                    </div>
                    {member.department && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">بەش:</span>
                        <span>
                          {DEPARTMENTS.find((d) => d.id === member.department)?.name}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-muted-foreground">مووچەی مانگانە:</span>
                      <span className="font-bold text-primary">
                        {formatCurrency(member.salary)}
                      </span>
                    </div>
                  </div>

                  {/* Monthly Payment Progress */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">مانگی دراو ({currentYear}):</span>
                      <span className={paidMonths === 12 ? 'text-success font-bold' : 'text-destructive font-bold'}>
                        {paidMonths} / 12
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full transition-all"
                        style={{ width: `${(paidMonths / 12) * 100}%` }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSalaryStaff(member);
                      }}
                    >
                      <Banknote className="h-4 w-4 ml-2" />
                      پارەدانی مووچە
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Staff Form Dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editStaff ? 'گۆڕینی زانیاری ستاف' : 'زیادکردنی ستافی نوێ'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">ناو</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="ناوی تەواو"
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">ژمارەی مۆبایل</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="07xxxxxxxxx"
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label>ڕۆڵ</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    role: value as 'teacher' | 'employee',
                  }))
                }
              >
                <SelectTrigger className="bg-muted/50">
                  <SelectValue placeholder="ڕۆڵێک هەڵبژێرە" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">مامۆستا</SelectItem>
                  <SelectItem value="employee">کارمەند</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'teacher' && (
              <div className="space-y-2">
                <Label>بەش</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, department: value as Department }))
                  }
                >
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="بەشێک هەڵبژێرە" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.icon} {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="salary">مووچە (دینار)</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, salary: e.target.value }))
                }
                placeholder="بڕی مووچە"
                className="bg-muted/50"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
                پاشگەزبوونەوە
              </Button>
              <Button type="submit" className="gradient-primary text-primary-foreground">
                {editStaff ? 'نوێکردنەوە' : 'زیادکردن'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Salary Dialog */}
      {salaryStaff && (
        <StaffSalaryDialog
          staff={salaryStaff}
          open={!!salaryStaff}
          onOpenChange={(open) => !open && setSalaryStaff(null)}
        />
      )}

      {/* Password Confirmation for Delete */}
      <PasswordConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="سڕینەوەی ستاف"
        description="ئەم کردارە ناگەڕێتەوە. تکایە پاسۆردی ئەدمین بنوسە بۆ دڵنیابوون."
      />
    </div>
  );
}