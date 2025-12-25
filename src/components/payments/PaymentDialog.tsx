import { useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { Student, Payment, formatCurrency, getDepartmentInfo } from '@/types';
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
import { Check, Receipt, Printer } from 'lucide-react';
import ntiLogo from '@/assets/nti-logo.jpg';

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
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!student) return null;

  const remainingAmount = student.totalFee - student.paidAmount;
  const department = getDepartmentInfo(student.department);

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

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ku">
      <head>
        <meta charset="UTF-8">
        <title>پسولەی پارەدان - ${student.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Noto Sans Arabic', sans-serif; 
            direction: rtl;
            padding: 20px;
            max-width: 210mm;
            margin: 0 auto;
          }
          .invoice-container { background: white; }
          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            border-bottom: 4px solid #0077B6;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .header-right { display: flex; align-items: center; gap: 15px; }
          .logo { width: 80px; height: 80px; object-fit: contain; border-radius: 8px; }
          .institute-name { font-size: 24px; font-weight: bold; color: #0077B6; }
          .institute-sub { font-size: 14px; color: #666; }
          .invoice-title { font-size: 18px; font-weight: bold; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .info-box { background: #f5f5f5; padding: 15px; border-radius: 12px; }
          .info-box h3 { font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 10px; }
          .info-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; }
          .info-label { color: #666; }
          .info-value { font-weight: 600; }
          .code { font-family: monospace; color: #0077B6; font-weight: bold; }
          .table-container { border: 2px solid #e0e0e0; border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          th { background: #e3f2fd; padding: 12px; text-align: right; font-weight: bold; }
          td { padding: 12px; border-top: 1px solid #e0e0e0; }
          .amount-row { background: #e8f5e9; }
          .amount-row td { color: #2e7d32; font-weight: bold; font-size: 16px; }
          .remaining-row td { font-weight: bold; font-size: 16px; }
          .remaining-positive { color: #d32f2f; }
          .remaining-zero { color: #2e7d32; }
          .note-box { background: #f5f5f5; padding: 15px; border-radius: 12px; margin-bottom: 20px; }
          .footer { border-top: 2px dashed #ddd; padding-top: 20px; margin-top: 20px; }
          .signatures { display: flex; justify-content: space-between; }
          .signature { text-align: center; }
          .signature-line { width: 150px; border-bottom: 1px solid #333; margin-top: 40px; }
          .thank-you { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
          @media print {
            body { padding: 0; }
            @page { margin: 15mm; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const newRemainingAmount = remainingAmount - (parseFloat(amount) || 0);
  const remainingAfterPayment = lastPayment ? (student.totalFee - (student.paidAmount + lastPayment.amount)) : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {showInvoice ? 'پسولەی پارەدان' : 'تۆمارکردنی پارەدان'}
          </DialogTitle>
        </DialogHeader>

        {showInvoice && lastPayment ? (
          <div className="space-y-6 animate-scale-in">
            {/* Printable Invoice */}
            <div ref={invoiceRef} className="invoice-container">
              {/* Header with Logo */}
              <div className="header">
                <div className="header-right">
                  <img src={ntiLogo} alt="NTI Logo" className="logo" />
                  <div>
                    <div className="institute-name">پەیمانگای تەکنیکی نیشتمانی</div>
                    <div className="institute-sub">National Technical Institute</div>
                    <div className="institute-sub">2013</div>
                  </div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div className="invoice-title">پسولەی پارەدان</div>
                  <div className="institute-sub">Payment Receipt</div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="info-grid">
                <div className="info-box">
                  <h3>زانیاری قوتابی</h3>
                  <div className="info-row">
                    <span className="info-label">کۆد:</span>
                    <span className="code">{student.code}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">ناو:</span>
                    <span className="info-value">{student.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">ژمارەی مۆبایل:</span>
                    <span>{student.phone}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">بەش:</span>
                    <span>{department.icon} {department.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">ژوور:</span>
                    <span>ژووری {student.room}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">ساڵ:</span>
                    <span>ساڵی {student.year}</span>
                  </div>
                </div>
                <div className="info-box">
                  <h3>زانیاری پسولە</h3>
                  <div className="info-row">
                    <span className="info-label">ژمارەی پسولە:</span>
                    <span style={{ fontFamily: 'monospace' }}>{lastPayment.id.substring(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">بەروار:</span>
                    <span>{new Date(lastPayment.date).toLocaleDateString('ar-IQ')}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">کات:</span>
                    <span>{new Date(lastPayment.date).toLocaleTimeString('ar-IQ')}</span>
                  </div>
                </div>
              </div>

              {/* Payment Table */}
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>وەسف</th>
                      <th style={{ textAlign: 'left' }}>بڕ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>کرێی خوێندن (سالانە)</td>
                      <td style={{ textAlign: 'left' }}>{formatCurrency(student.totalFee)}</td>
                    </tr>
                    <tr>
                      <td>کۆی پارەدراو پێشتر</td>
                      <td style={{ textAlign: 'left' }}>{formatCurrency(student.paidAmount)}</td>
                    </tr>
                    <tr className="amount-row">
                      <td>بڕی پارەدانی ئێستا</td>
                      <td style={{ textAlign: 'left' }}>{formatCurrency(lastPayment.amount)}</td>
                    </tr>
                    <tr className="remaining-row">
                      <td>ماوەی قەرز</td>
                      <td className={remainingAfterPayment > 0 ? 'remaining-positive' : 'remaining-zero'} style={{ textAlign: 'left' }}>
                        {formatCurrency(remainingAfterPayment)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Note */}
              {lastPayment.note && (
                <div className="note-box">
                  <strong>تێبینی:</strong>
                  <p style={{ marginTop: '5px', color: '#666' }}>{lastPayment.note}</p>
                </div>
              )}

              {/* Footer */}
              <div className="footer">
                <div className="signatures">
                  <div className="signature">
                    <p>واژووی وەرگر:</p>
                    <div className="signature-line"></div>
                  </div>
                  <div className="signature">
                    <p>واژووی ژمێریاری:</p>
                    <div className="signature-line"></div>
                  </div>
                </div>
                <p className="thank-you">
                  سوپاس بۆ متمانەکەتان بە پەیمانگای تەکنیکی نیشتمانی
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handlePrint} variant="outline" className="flex-1">
                <Printer className="h-4 w-4 ml-2" />
                چاپکردن
              </Button>
              <Button onClick={handleClose} className="flex-1 gradient-primary text-primary-foreground">
                داخستن
              </Button>
            </div>
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
                  <p className="text-xs font-mono text-primary">{student.code}</p>
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
