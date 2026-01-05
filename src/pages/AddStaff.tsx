import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { useStore } from '@/store/useStore';
import { Staff as StaffType, DEPARTMENTS, Department } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Users, GraduationCap, Briefcase, CheckCircle } from 'lucide-react';

export default function AddStaff() {
  const { addStaff } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [successCount, setSuccessCount] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: '' as 'teacher' | 'employee',
    department: '' as Department | '',
    salary: '',
  });

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

    addStaff({
      id: crypto.randomUUID(),
      ...staffData,
      salaryPayments: [],
    });
    toast.success('ستاف بە سەرکەوتوویی زیاد کرا');
    
    setSuccessCount(prev => prev + 1);
    setFormOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      role: '' as 'teacher' | 'employee',
      department: '',
      salary: '',
    });
  };

  return (
    <div className="min-h-screen pb-8">
      <Header
        title="تۆمارکردنی ستاف"
        subtitle="زیادکردنی مامۆستا یان کارمەند"
      />

      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          {/* Stats */}
          <div className="rounded-2xl bg-card p-6 shadow-lg mb-8 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl gradient-secondary flex items-center justify-center">
                <Users className="h-8 w-8 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ستاف تۆمارکراو ئەمڕۆ</p>
                <p className="text-3xl font-bold text-foreground">{successCount}</p>
              </div>
            </div>
          </div>

          {/* Add Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => setFormOpen(true)}
              size="lg"
              className="gradient-secondary text-secondary-foreground px-12 py-6 text-lg"
            >
              <Plus className="h-6 w-6 ml-3" />
              تۆمارکردنی ستافی نوێ
            </Button>
          </div>

          {successCount > 0 && (
            <div className="mt-8 rounded-2xl bg-success/10 border border-success/20 p-6 animate-slide-up">
              <div className="flex items-center gap-3 text-success">
                <CheckCircle className="h-6 w-6" />
                <span className="font-semibold">{successCount} ستاف بە سەرکەوتوویی تۆمارکران</span>
              </div>
            </div>
          )}
        </div>
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
            <DialogTitle>زیادکردنی ستافی نوێ</DialogTitle>
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
                  <SelectItem value="teacher">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      مامۆستا
                    </div>
                  </SelectItem>
                  <SelectItem value="employee">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      کارمەند
                    </div>
                  </SelectItem>
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
                زیادکردن
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
