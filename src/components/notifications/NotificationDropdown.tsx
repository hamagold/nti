import { useState } from 'react';
import { Bell, AlertTriangle, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/settingsStore';
import { formatCurrency } from '@/types';
import { cn } from '@/lib/utils';

interface UnpaidStudent {
  id: string;
  name: string;
  code: string;
  debt: number;
  lastPaymentDate: string | null;
  daysSincePayment: number;
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { students } = useStore();
  const { notificationDays } = useSettingsStore();

  // Calculate unpaid students
  const getUnpaidStudents = (): UnpaidStudent[] => {
    const now = new Date();
    const unpaidStudents: UnpaidStudent[] = [];

    students.forEach((student) => {
      const debt = student.totalFee - student.paidAmount;
      if (debt <= 0) return;

      // Get last payment date
      let lastPaymentDate: string | null = null;
      let daysSincePayment = 0;

      if (student.payments && student.payments.length > 0) {
        const sortedPayments = [...student.payments].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        lastPaymentDate = sortedPayments[0].date;
        const lastDate = new Date(lastPaymentDate);
        daysSincePayment = Math.floor(
          (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );
      } else {
        // If no payments, use registration date
        const regDate = new Date(student.registrationDate);
        daysSincePayment = Math.floor(
          (now.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      if (daysSincePayment >= notificationDays) {
        unpaidStudents.push({
          id: student.id,
          name: student.name,
          code: student.code,
          debt,
          lastPaymentDate,
          daysSincePayment,
        });
      }
    });

    return unpaidStudents.sort((a, b) => b.daysSincePayment - a.daysSincePayment);
  };

  const unpaidStudents = getUnpaidStudents();
  const hasNotifications = unpaidStudents.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-primary/10"
        >
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground font-bold animate-pulse">
              {unpaidStudents.length > 99 ? '99+' : unpaidStudents.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96 p-0" align="start">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h3 className="font-bold text-foreground">ئاگاداریەکان</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {hasNotifications ? (
          <>
            <div className="px-4 py-2 bg-muted/50 text-sm text-muted-foreground">
              قوتابیانی پارەیان نەداوە لە {notificationDays} ڕۆژی ڕابردوو
            </div>
            <ScrollArea className="h-[300px] md:h-[400px]">
              <div className="p-2 space-y-2">
                {unpaidStudents.map((student) => (
                  <div
                    key={student.id}
                    className={cn(
                      'p-3 rounded-xl border transition-colors',
                      student.daysSincePayment > 90
                        ? 'bg-destructive/10 border-destructive/30'
                        : student.daysSincePayment > 60
                        ? 'bg-warning/10 border-warning/30'
                        : 'bg-muted/50 border-border'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-foreground truncate">
                            {student.name}
                          </p>
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full shrink-0',
                              student.daysSincePayment > 90
                                ? 'bg-destructive text-destructive-foreground'
                                : student.daysSincePayment > 60
                                ? 'bg-warning text-warning-foreground'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {student.daysSincePayment} ڕۆژ
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          کۆد: {student.code}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            قەرز:
                          </span>
                          <span className="text-sm font-bold text-destructive">
                            {formatCurrency(student.debt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t border-border p-3 bg-muted/30">
              <p className="text-xs text-center text-muted-foreground">
                کۆی قوتابیانی قەرزدار: <span className="font-bold text-foreground">{unpaidStudents.length}</span>
              </p>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-4">
              <Bell className="h-8 w-8 text-success" />
            </div>
            <p className="font-bold text-foreground">هیچ ئاگاداریەک نییە</p>
            <p className="text-sm text-muted-foreground mt-1">
              هەموو قوتابیان پارەیان داوە
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
