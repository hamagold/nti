import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Student, Payment, formatCurrency } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Check, Receipt } from 'lucide-react';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

export function PaymentDialog({ open, onOpenChange, student }: PaymentDialogProps) {
  const { addPayment } = useStore();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);

  if (!student) return null;

  const remainingAmount = student.totalFee - student.paidAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error('تکایە بڕێکی دروست بنووسە');
      return;
    }

    if (paymentAmount > remainingAmount) {
      toast.error('بڕی پارە لە قەرزەکە زیاترە');
      return;
    }

    const payment: Payment = {
      id: crypto.randomUUID(),
      studentId: student.id,
      amount: paymentAmount,
      date: new Date().toISOString(),
      note,
    };

    addPayment(student.id, payment);
    setLastPayment(payment);
    setShowInvoice(true);
    toast.success('پارەدان بە سەرکەوتوویی تۆمار کرا');
  };

  const handleClose = () => {
    setAmount('');
    setNote('');
    setShowInvoice(false);
    setLastPayment(null);
    onOpenChange(false);
  };

  const newRemainingAmount = remainingAmount - (parseFloat(amount) || 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {showInvoice ? 'پسولەی پارەدان' : 'تۆمارکردنی پارەدان'}
          </DialogTitle>
        </DialogHeader>

        {showInvoice && lastPayment ? (
          <div className="space-y-6 animate-scale-in">
            {/* Invoice */}
            <div className="bg-muted/50 rounded-2xl p-6 border-2 border-dashed border-primary/30">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success/10 mb-3">
                  <Check className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  پارەدان تەواو بوو
                </h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">ناوی قوتابی:</span>
                  <span className="font-semibold">{student.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">بڕی پارەدان:</span>
                  <span className="font-bold text-success">
                    {formatCurrency(lastPayment.amount)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">کۆی پارەدراو:</span>
                  <span className="font-semibold">
                    {formatCurrency(student.paidAmount + lastPayment.amount)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">ماوەی قەرز:</span>
                  <span className={`font-bold ${remainingAmount - lastPayment.amount > 0 ? 'text-destructive' : 'text-success'}`}>
                    {formatCurrency(remainingAmount - lastPayment.amount)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">بەروار:</span>
                  <span className="font-semibold">
                    {new Date(lastPayment.date).toLocaleDateString('ar-IQ')}
                  </span>
                </div>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full gradient-primary text-primary-foreground">
              داخستن
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Info */}
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  {student.photo ? (
                    <img
                      src={student.photo}
                      alt={student.name}
                      className="h-full w-full rounded-xl object-cover"
                    />
                  ) : (
                    <span className="text-xl">👤</span>
                  )}
                </div>
                <div>
                  <p className="font-bold">{student.name}</p>
                  <p className="text-sm text-muted-foreground">
                    قەرز: <span className="text-destructive font-semibold">{formatCurrency(remainingAmount)}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">بڕی پارە (دینار)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="بڕی پارە بنووسە"
                className="bg-muted/50 text-lg font-bold"
              />
              {amount && parseFloat(amount) > 0 && (
                <p className="text-sm text-muted-foreground">
                  دوای پارەدان قەرز دەبێتە:{' '}
                  <span className={newRemainingAmount > 0 ? 'text-warning' : 'text-success'}>
                    {formatCurrency(Math.max(0, newRemainingAmount))}
                  </span>
                </p>
              )}
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="note">تێبینی (ئارەزوومەندانە)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="تێبینی..."
                className="bg-muted/50 resize-none"
                rows={2}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
              >
                پاشگەزبوونەوە
              </Button>
              <Button
                type="submit"
                className="flex-1 gradient-primary text-primary-foreground"
              >
                تۆمارکردن
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
