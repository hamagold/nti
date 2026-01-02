import { Student, formatCurrency, getDepartmentInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Phone, MapPin, CreditCard, Trash2, Edit, User, History } from 'lucide-react';

interface StudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
  onPayment: (student: Student) => void;
  onViewHistory?: (student: Student) => void;
  delay?: number;
}

export function StudentCard({
  student,
  onEdit,
  onDelete,
  onPayment,
  onViewHistory,
  delay = 0,
}: StudentCardProps) {
  const department = getDepartmentInfo(student.department);
  const remainingAmount = student.totalFee - student.paidAmount;
  const paidPercentage = (student.paidAmount / student.totalFee) * 100;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-lg transition-all duration-300 hover:shadow-xl animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header with photo */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
          {student.photo ? (
            <img
              src={student.photo}
              alt={student.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-foreground truncate">
            {student.name}
          </h3>
          <p className="text-xs font-mono text-primary font-semibold mb-1">
            {student.code}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {department.icon} {department.name}
            </Badge>
            <Badge variant="outline" className="text-xs">
              ژووری {student.room}
            </Badge>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{student.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{student.address}</span>
        </div>
      </div>

      {/* Payment Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">پارەدان</span>
          <span className="font-semibold">
            {formatCurrency(student.paidAmount)} / {formatCurrency(student.totalFee)}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              paidPercentage >= 100
                ? 'bg-success'
                : paidPercentage >= 50
                ? 'bg-primary'
                : 'bg-warning'
            )}
            style={{ width: `${Math.min(paidPercentage, 100)}%` }}
          />
        </div>
        {remainingAmount > 0 && (
          <p className="text-xs text-destructive mt-1">
            ماوە: {formatCurrency(remainingAmount)}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onPayment(student)}
        >
          <CreditCard className="h-4 w-4 ml-1" />
          پارەدان
        </Button>
        {onViewHistory && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-primary hover:text-primary hover:bg-primary/10"
            onClick={() => onViewHistory(student)}
            title="مێژووی پارەدانەکان"
          >
            <History className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => onEdit(student)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(student.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
