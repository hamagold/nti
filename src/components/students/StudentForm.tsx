import { useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { Student, Department, Room, Year, DEPARTMENTS, ROOMS, YEARS, generateStudentCode } from '@/types';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Camera, Upload, X } from 'lucide-react';

interface StudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editStudent?: Student;
  onSuccess?: () => void;
}

export function StudentForm({ open, onOpenChange, editStudent, onSuccess }: StudentFormProps) {
  const { students, addStudent, updateStudent } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const getInitialFormData = () => ({
    name: editStudent?.name || '',
    phone: editStudent?.phone || '',
    address: editStudent?.address || '',
    photo: editStudent?.photo || '',
    department: editStudent?.department || '' as Department,
    room: editStudent?.room || '' as Room,
    year: editStudent?.year?.toString() || '',
    totalFee: editStudent?.totalFee?.toString() || '',
  });
  
  const [formData, setFormData] = useState(getInitialFormData());
  
  // Update form data when editStudent changes
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setFormData({
        name: editStudent?.name || '',
        phone: editStudent?.phone || '',
        address: editStudent?.address || '',
        photo: editStudent?.photo || '',
        department: editStudent?.department || '' as Department,
        room: editStudent?.room || '' as Room,
        year: editStudent?.year?.toString() || '',
        totalFee: editStudent?.totalFee?.toString() || '',
      });
    }
    onOpenChange(isOpen);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.department || !formData.room || !formData.year || !formData.totalFee) {
      toast.error('تکایە هەموو خانەکان پڕبکەوە');
      return;
    }

    const customFee = parseFloat(formData.totalFee);
    
    if (editStudent) {
      // Only update the fields that changed, preserve all other data
      updateStudent(editStudent.id, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        photo: formData.photo,
        department: formData.department as Department,
        room: formData.room as Room,
        // Don't update year, totalFee, paidAmount, payments, yearPayments here
        // Those are managed separately through payment and progression systems
      });
    } else {
      const studentCode = generateStudentCode(
        formData.department as Department,
        parseInt(formData.year) as Year,
        students
      );
      const newStudent: Student = {
        id: crypto.randomUUID(),
        code: studentCode,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        photo: formData.photo,
        department: formData.department as Department,
        room: formData.room as Room,
        year: parseInt(formData.year) as Year,
        totalFee: customFee,
        paidAmount: 0,
        registrationDate: new Date().toISOString(),
        payments: [],
      };
      addStudent(newStudent);
      onSuccess?.();
    }
    
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {editStudent ? 'گۆڕینی زانیاری قوتابی' : 'تۆمارکردنی قوتابی نوێ'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Photo Upload */}
          <div className="flex justify-center">
            <div className="relative">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative h-32 w-32 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-primary/30 bg-muted/50 transition-all hover:border-primary hover:bg-muted"
              >
                {formData.photo ? (
                  <>
                    <img
                      src={formData.photo}
                      alt="Student"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Camera className="h-8 w-8 text-background" />
                    </div>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">وێنەی قوتابی</span>
                  </div>
                )}
              </div>
              {formData.photo && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, photo: '' }))}
                  className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">ناوی قوتابی</Label>
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">ناونیشان</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                placeholder="ناونیشانی قوتابی"
                className="bg-muted/50"
              />
            </div>

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
                      <span className="flex items-center gap-2">
                        <span>{dept.icon}</span>
                        <span>{dept.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>ژوور</Label>
              <Select
                value={formData.room}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, room: value as Room }))
                }
              >
                <SelectTrigger className="bg-muted/50">
                  <SelectValue placeholder="ژوورێک هەڵبژێرە" />
                </SelectTrigger>
                <SelectContent>
                  {ROOMS.map((room) => (
                    <SelectItem key={room} value={room}>
                      ژووری {room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>ساڵ</Label>
              <Select
                value={formData.year}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, year: value }))
                }
              >
                <SelectTrigger className="bg-muted/50">
                  <SelectValue placeholder="ساڵێک هەڵبژێرە" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      ساڵی {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="totalFee">کرێی خوێندن (دینار)</Label>
              <Input
                id="totalFee"
                type="number"
                value={formData.totalFee}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, totalFee: e.target.value }))
                }
                placeholder="بڕی کرێی خوێندن بۆ ئەم قوتابی"
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">
                کرێی خوێندن بۆ هەر قوتابی جیاوازە و دەتوانی خۆت دیاری بکەیت
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              پاشگەزبوونەوە
            </Button>
            <Button type="submit" className="gradient-primary text-primary-foreground px-8">
              {editStudent ? 'نوێکردنەوە' : 'تۆمارکردن'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
