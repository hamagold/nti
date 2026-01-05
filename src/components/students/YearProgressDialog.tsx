import { useState } from 'react';
import { Student, formatCurrency, Year } from '@/types';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowUp, AlertCircle } from 'lucide-react';

interface YearProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

export function YearProgressDialog({ open, onOpenChange, student }: YearProgressDialogProps) {
  const { progressToNextYear } = useStore();
  const { departments } = useSettingsStore();
  
  // Get default fee from department or use current year fee
  const dept = departments.find(d => d.id === student?.department);
  const defaultFee = dept?.yearlyFee || student?.totalFee || 0;
  
  const [newFee, setNewFee] = useState<string>(defaultFee.toString());
  
  // Reset fee when dialog opens with new student
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && student) {
      const fee = dept?.yearlyFee || student.totalFee;
      setNewFee(fee.toString());
    }
    onOpenChange(isOpen);
  };

  const handleProgress = () => {
    if (!student) return;
    
    const feeAmount = parseFloat(newFee) || defaultFee;
    
    // Use custom progression with fee
    const success = progressToNextYear(student.id, feeAmount);
    
    if (success) {
      toast.success(`قوتابی ${student.name} پەڕییەوە بۆ ساڵی ${student.year + 1}`);
      onOpenChange(false);
    } else {
      toast.error('نەتوانرا پەڕینەوە ئەنجام بدرێت');
    }
  };

  if (!student) return null;

  const nextYear = (student.year + 1) as Year;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <ArrowUp className="h-5 w-5 text-success" />
            پەڕینەوە بۆ ساڵی {nextYear}
          </DialogTitle>
          <DialogDescription>
            قوتابی {student.name} پارەکانی ساڵی {student.year} تەواو کردووە
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Current Year Summary */}
          <div className="p-4 rounded-xl bg-success/10 border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-success" />
              <span className="font-semibold text-success">ساڵی {student.year} تەواو بوو</span>
            </div>
            <p className="text-sm text-muted-foreground">
              کۆی پارەی دراو: {formatCurrency(student.paidAmount)}
            </p>
          </div>

          {/* New Year Fee */}
          <div className="space-y-3">
            <Label htmlFor="newFee" className="text-base font-semibold">
              کرێی ساڵی {nextYear} (دینار)
            </Label>
            <Input
              id="newFee"
              type="number"
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              placeholder="بڕی کرێی ساڵی نوێ"
              className="bg-muted/50 text-lg h-12"
            />
            <p className="text-xs text-muted-foreground">
              ئەگەر نەتگۆڕی، هەمان بڕی ساڵی پێشوو بەکاردێت: {formatCurrency(defaultFee)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              پاشگەزبوونەوە
            </Button>
            <Button 
              onClick={handleProgress}
              className="bg-success hover:bg-success/90 text-success-foreground px-8"
            >
              <ArrowUp className="h-4 w-4 ml-2" />
              پەڕینەوە بۆ ساڵی {nextYear}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
