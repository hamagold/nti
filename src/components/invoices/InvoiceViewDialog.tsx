import { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, X } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { formatCurrency, getDepartmentInfo } from '@/types';
import { format } from 'date-fns';
import { useSettingsStore } from '@/store/settingsStore';

interface InvoicePayment {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  note?: string;
  studentName: string;
  studentPhone: string;
  department: string;
  room: string;
  year: number;
  totalFee: number;
  totalPaid: number;
}

interface InvoiceViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: InvoicePayment | null;
}

export function InvoiceViewDialog({ open, onOpenChange, payment }: InvoiceViewDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { contactInfo } = useSettingsStore();
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  if (!payment) return null;

  const dept = getDepartmentInfo(payment.department as any);
  const remaining = payment.totalFee - payment.totalPaid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>پسولەی پارەدان</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handlePrint()}>
                <Printer className="h-4 w-4 ml-2" />
                چاپکردن
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Printable Invoice */}
        <div ref={printRef} className="p-6 bg-card print:bg-white">
          {/* Header */}
          <div className="text-center border-b border-border pb-4 mb-6">
            <h1 className="text-2xl font-bold text-foreground">پەیمانگای تەکنیکی نیشتمانی</h1>
            <p className="text-sm text-muted-foreground mt-1">{contactInfo.location}</p>
            <p className="text-sm text-muted-foreground">{contactInfo.phone}</p>
          </div>

          {/* Invoice Number */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-muted-foreground">ژمارەی پسولە</p>
              <code className="text-lg font-bold text-primary">#{payment.id.slice(0, 8).toUpperCase()}</code>
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">بەروار</p>
              <p className="font-bold">{format(new Date(payment.date), 'yyyy/MM/dd')}</p>
              <p className="text-sm text-muted-foreground">{format(new Date(payment.date), 'HH:mm')}</p>
            </div>
          </div>

          {/* Student Info */}
          <div className="bg-muted/50 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-foreground mb-3">زانیاری قوتابی</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">ناو: </span>
                <span className="font-bold">{payment.studentName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">مۆبایل: </span>
                <span dir="ltr">{payment.studentPhone}</span>
              </div>
              <div>
                <span className="text-muted-foreground">بەش: </span>
                <Badge variant="secondary">{dept.icon} {dept.name}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">ژووری: </span>
                <span>{payment.room} - ساڵی {payment.year}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="border border-border rounded-xl overflow-hidden mb-6">
            <div className="bg-primary/10 p-3">
              <h3 className="font-bold text-foreground">وردەکاری پارەدان</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">کۆی کرێی ساڵانە:</span>
                <span className="font-bold">{formatCurrency(payment.totalFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">کۆی پارەی دراو:</span>
                <span className="font-bold text-success">{formatCurrency(payment.totalPaid)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">ماوە:</span>
                <span className={`font-bold ${remaining > 0 ? 'text-warning' : 'text-success'}`}>
                  {formatCurrency(remaining)}
                </span>
              </div>
            </div>
          </div>

          {/* Current Payment */}
          <div className="bg-success/10 border border-success/20 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg">پارەی ئەم پسولەیە:</span>
              <span className="text-2xl font-bold text-success">{formatCurrency(payment.amount)}</span>
            </div>
            {payment.note && (
              <p className="text-sm text-muted-foreground mt-2">تێبینی: {payment.note}</p>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground border-t border-border pt-4">
            <p>سوپاس بۆ متمانەتان</p>
            <p className="mt-1">پەیمانگای تەکنیکی نیشتمانی - {contactInfo.website}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
