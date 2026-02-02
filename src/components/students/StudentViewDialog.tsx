import { Student, formatCurrency, getDepartmentInfo } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Phone, MapPin, User, Calendar, CreditCard, GraduationCap, Hash } from 'lucide-react';

interface StudentViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

export function StudentViewDialog({ open, onOpenChange, student }: StudentViewDialogProps) {
  const { t } = useTranslation();

  if (!student) return null;

  const department = getDepartmentInfo(student.department);
  const remainingAmount = student.totalFee - student.paidAmount;
  const paidPercentage = student.totalFee > 0 ? (student.paidAmount / student.totalFee) * 100 : 0;

  // Get translated department name
  const getDeptName = (deptId: string) => {
    const deptKey = `departments.${deptId}` as const;
    return t(deptKey);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {t('students.viewInfo')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Photo and Name */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted shadow-lg">
              {student.photo ? (
                <img
                  src={student.photo}
                  alt={student.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="font-bold text-xl text-foreground">{student.name}</h3>
              <p className="text-sm font-mono text-primary font-semibold">{student.code}</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid gap-4 rounded-xl bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('common.department')}</p>
                <p className="font-semibold">{department.icon} {getDeptName(student.department)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Hash className="h-5 w-5 text-primary" />
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">{t('common.room')}</p>
                  <p className="font-semibold">{student.room}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('common.year')}</p>
                  <p className="font-semibold">{student.year}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('students.phone')}</p>
                <p className="font-semibold" dir="ltr">{student.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('students.address')}</p>
                <p className="font-semibold">{student.address || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('students.registrationDate')}</p>
                <p className="font-semibold">
                  {format(new Date(student.registrationDate), 'yyyy/MM/dd')}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-xl bg-muted/50 p-4 space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <p className="font-semibold">{t('students.paymentInfo')}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-card p-3 shadow-sm">
                <p className="text-xs text-muted-foreground">{t('students.totalFee')}</p>
                <p className="font-bold text-foreground">{formatCurrency(student.totalFee)}</p>
              </div>
              <div className="rounded-lg bg-card p-3 shadow-sm">
                <p className="text-xs text-muted-foreground">{t('common.paid')}</p>
                <p className="font-bold text-success">{formatCurrency(student.paidAmount)}</p>
              </div>
              <div className="rounded-lg bg-card p-3 shadow-sm">
                <p className="text-xs text-muted-foreground">{t('common.remaining')}</p>
                <p className="font-bold text-destructive">{formatCurrency(remainingAmount)}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    paidPercentage >= 100
                      ? 'bg-success'
                      : paidPercentage >= 50
                      ? 'bg-primary'
                      : 'bg-warning'
                  }`}
                  style={{ width: `${Math.min(paidPercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-1">
                {Math.round(paidPercentage)}% {t('students.completed')}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
