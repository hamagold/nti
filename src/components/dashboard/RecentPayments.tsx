import { useStore } from '@/store/useStore';
import { formatCurrency, getDepartmentInfo } from '@/types';
import { format } from 'date-fns';
import { CreditCard } from 'lucide-react';

export function RecentPayments() {
  const { students } = useStore();

  // Get all payments with student info
  const allPayments = students
    .flatMap((student) =>
      student.payments.map((payment) => ({
        ...payment,
        studentName: student.name,
        department: student.department,
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="rounded-2xl bg-card p-6 shadow-lg animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground">کۆتا پارەدانەکان</h3>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <CreditCard className="h-5 w-5 text-primary" />
        </div>
      </div>

      {allPayments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <CreditCard className="h-12 w-12 mb-3 opacity-50" />
          <p>هیچ پارەدانێک تۆمار نەکراوە</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allPayments.map((payment, index) => {
            const dept = getDepartmentInfo(payment.department);
            return (
              <div
                key={payment.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 transition-all hover:bg-muted animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  {dept.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {payment.studentName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(payment.date), 'yyyy/MM/dd')}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-success">
                    +{formatCurrency(payment.amount)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
