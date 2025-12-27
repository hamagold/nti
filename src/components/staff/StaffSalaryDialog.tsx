import { useState, useRef } from 'react';
import { Staff as StaffType, formatCurrency, MONTHS, SalaryPayment } from '@/types';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Check, X, Printer, Banknote } from 'lucide-react';
import { SalaryReceiptPrint } from './SalaryReceiptPrint';
import { useReactToPrint } from 'react-to-print';

interface StaffSalaryDialogProps {
  staff: StaffType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StaffSalaryDialog({ staff, open, onOpenChange }: StaffSalaryDialogProps) {
  const { addSalaryPayment } = useStore();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [amount, setAmount] = useState(staff.salary.toString());
  const [note, setNote] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastPayment, setLastPayment] = useState<SalaryPayment | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Years from 2026 to 2035
  const years = Array.from({ length: 10 }, (_, i) => 2026 + i);
  
  const staffPayments = staff.salaryPayments || [];
  const paidMonths = staffPayments
    .filter(p => p.year === selectedYear)
    .map(p => p.month);
  
  const totalPaidThisYear = staffPayments
    .filter(p => p.year === selectedYear)
    .reduce((sum, p) => sum + p.amount, 0);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const handlePaySalary = () => {
    if (!selectedMonth) {
      toast.error('تکایە مانگێک هەڵبژێرە');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('تکایە بڕی مووچە بنوسە');
      return;
    }

    if (paidMonths.includes(selectedMonth)) {
      toast.error('مووچەی ئەم مانگە پێشتر دراوە');
      return;
    }

    const payment: SalaryPayment = {
      id: crypto.randomUUID(),
      staffId: staff.id,
      month: selectedMonth,
      year: selectedYear,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      note: note || undefined,
    };

    addSalaryPayment(staff.id, payment);
    setLastPayment(payment);
    setShowReceipt(true);
    toast.success('مووچە بە سەرکەوتوویی درا');
    setSelectedMonth(null);
    setNote('');
  };

  const getPaymentForMonth = (month: number) => {
    return staffPayments.find(p => p.month === month && p.year === selectedYear);
  };

  const handlePrintReceipt = (payment: SalaryPayment) => {
    setLastPayment(payment);
    setShowReceipt(true);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Banknote className="h-6 w-6 text-primary" />
            پارەدانی مووچە - {staff.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Year Selector */}
          <div className="flex items-center gap-4">
            <Label>ساڵ:</Label>
            <div className="flex gap-2">
              {years.map(year => (
                <Button
                  key={year}
                  variant={selectedYear === year ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedYear(year)}
                >
                  {year}
                </Button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">مووچەی مانگانە</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(staff.salary)}</p>
            </div>
            <div className="bg-success/10 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">دراوە لەم ساڵە</p>
              <p className="text-lg font-bold text-success">{formatCurrency(totalPaidThisYear)}</p>
            </div>
            <div className="bg-destructive/10 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">مانگی دراو</p>
              <p className="text-lg font-bold text-destructive">{paidMonths.length} / 12</p>
            </div>
          </div>

          {/* Month Grid */}
          <div>
            <Label className="mb-3 block">دۆخی مانگەکان:</Label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {MONTHS.map(month => {
                const isPaid = paidMonths.includes(month.id);
                const payment = getPaymentForMonth(month.id);
                
                return (
                  <div
                    key={month.id}
                    className={`relative rounded-xl p-3 border-2 transition-all cursor-pointer ${
                      isPaid 
                        ? 'border-success bg-success/10' 
                        : selectedMonth === month.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-primary/50'
                    }`}
                    onClick={() => !isPaid && setSelectedMonth(month.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{month.name}</span>
                      {isPaid ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    {isPaid && payment ? (
                      <div className="space-y-1">
                        <p className="text-xs text-success font-medium">
                          {formatCurrency(payment.amount)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-6 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintReceipt(payment);
                          }}
                        >
                          <Printer className="h-3 w-3 ml-1" />
                          چاپ
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        نەدراوە
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Form */}
          {selectedMonth && !paidMonths.includes(selectedMonth) && (
            <div className="bg-muted/30 rounded-xl p-4 space-y-4">
              <h4 className="font-bold">
                پارەدان بۆ: {MONTHS.find(m => m.id === selectedMonth)?.name}
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary-amount">بڕی مووچە</Label>
                  <Input
                    id="salary-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary-note">تێبینی</Label>
                  <Textarea
                    id="salary-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="تێبینی (ئارەزوومەندانە)"
                    className="bg-background h-10 resize-none"
                  />
                </div>
              </div>

              <Button 
                onClick={handlePaySalary}
                className="w-full gradient-primary text-primary-foreground"
              >
                <Banknote className="h-5 w-5 ml-2" />
                پارەدان
              </Button>
            </div>
          )}
        </div>

        {/* Print Receipt */}
        {showReceipt && lastPayment && (
          <div className="mt-6 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold">پسوولەی مووچە</h4>
              <Button onClick={() => handlePrint()} variant="outline">
                <Printer className="h-4 w-4 ml-2" />
                چاپکردن
              </Button>
            </div>
            <div ref={printRef} className="print:block">
              <SalaryReceiptPrint staff={staff} payment={lastPayment} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}