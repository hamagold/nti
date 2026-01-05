import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Student, Payment, formatCurrency, getDepartmentInfo } from '@/types';
import { Printer, Receipt, Calendar, FileText, Filter, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import ntiLogo from '@/assets/nti-logo.jpg';

interface PaymentHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

export function PaymentHistoryDialog({ open, onOpenChange, student }: PaymentHistoryDialogProps) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const department = student ? getDepartmentInfo(student.department) : null;

  // Filter payments by date range
  const filteredPayments = useMemo(() => {
    if (!student) return [];
    let payments = [...student.payments];
    
    if (startDate) {
      payments = payments.filter(p => new Date(p.date) >= startDate);
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      payments = payments.filter(p => new Date(p.date) <= endOfDay);
    }
    
    return payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [student?.payments, startDate, endDate]);

  if (!student || !department) return null;

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handlePrint = (payment: Payment) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ku">
      <head>
        <meta charset="UTF-8">
        <title>پسوولەی پارەدان</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Noto Sans Arabic', Arial, sans-serif;
            padding: 20px;
            direction: rtl;
            background: white;
          }
          
          .receipt {
            max-width: 400px;
            margin: 0 auto;
            border: 2px solid #1e88e5;
            border-radius: 12px;
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #1e88e5, #1565c0);
            color: white;
            padding: 20px;
            text-align: center;
          }
          
          .logo {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            margin: 0 auto 10px;
            background: white;
            padding: 3px;
          }
          
          .logo img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
          }
          
          .institute-name {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 5px;
          }
          
          .subtitle {
            font-size: 12px;
            opacity: 0.9;
          }
          
          .receipt-title {
            background: #e3f2fd;
            padding: 10px;
            text-align: center;
            font-weight: 600;
            color: #1565c0;
            border-bottom: 1px solid #bbdefb;
          }
          
          .content {
            padding: 20px;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dashed #e0e0e0;
          }
          
          .info-row:last-child {
            border-bottom: none;
          }
          
          .label {
            color: #666;
            font-size: 13px;
          }
          
          .value {
            font-weight: 600;
            color: #333;
            font-size: 13px;
          }
          
          .amount-section {
            background: #f5f5f5;
            padding: 15px;
            margin: 15px 0;
            border-radius: 8px;
            text-align: center;
          }
          
          .amount-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
          }
          
          .amount-value {
            font-size: 24px;
            font-weight: 700;
            color: #2e7d32;
          }
          
          .note-section {
            background: #fff3e0;
            padding: 10px;
            border-radius: 6px;
            margin-top: 10px;
          }
          
          .note-label {
            font-size: 11px;
            color: #e65100;
            margin-bottom: 3px;
          }
          
          .note-text {
            font-size: 12px;
            color: #333;
          }
          
          .footer {
            background: #fafafa;
            padding: 15px;
            text-align: center;
            border-top: 1px solid #eee;
          }
          
          .signature-line {
            border-top: 1px solid #999;
            width: 150px;
            margin: 20px auto 5px;
            padding-top: 5px;
            font-size: 11px;
            color: #666;
          }
          
          .thank-you {
            font-size: 11px;
            color: #666;
            margin-top: 10px;
          }
          
          @media print {
            body { padding: 0; }
            .receipt { border: 1px solid #ccc; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="logo">
              <img src="${ntiLogo}" alt="NTI Logo" />
            </div>
            <div class="institute-name">پەیمانگای تەکنیکی نیشتمانی</div>
            <div class="subtitle">National Technical Institute</div>
          </div>
          
          <div class="receipt-title">
            <span>📄 پسوولەی پارەدان</span>
          </div>
          
          <div class="content">
            <div class="info-row">
              <span class="label">ژمارەی پسوولە:</span>
              <span class="value">#${payment.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div class="info-row">
              <span class="label">بەروار:</span>
              <span class="value">${new Date(payment.date).toLocaleDateString('ku-IQ')}</span>
            </div>
            <div class="info-row">
              <span class="label">ناوی قوتابی:</span>
              <span class="value">${student.name}</span>
            </div>
            <div class="info-row">
              <span class="label">کۆدی قوتابی:</span>
              <span class="value">${student.code}</span>
            </div>
            <div class="info-row">
              <span class="label">بەش:</span>
              <span class="value">${department.icon} ${department.name}</span>
            </div>
            <div class="info-row">
              <span class="label">قۆناغ:</span>
              <span class="value">${student.year}</span>
            </div>
            
            <div class="amount-section">
              <div class="amount-label">بڕی پارەدان</div>
              <div class="amount-value">${formatCurrency(payment.amount)}</div>
            </div>
            
            <div class="info-row">
              <span class="label">کۆی پارەی دراو:</span>
              <span class="value">${formatCurrency(student.paidAmount)}</span>
            </div>
            <div class="info-row">
              <span class="label">کۆی پارەی ماوە:</span>
              <span class="value">${formatCurrency(student.totalFee - student.paidAmount)}</span>
            </div>
            
            ${payment.note ? `
              <div class="note-section">
                <div class="note-label">تێبینی:</div>
                <div class="note-text">${payment.note}</div>
              </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <div class="signature-line">واژووی وەرگر</div>
            <div class="thank-you">سوپاس بۆ متمانەتان 💙</div>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            مێژووی پارەدانەکان - {student.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Student Summary */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">کۆی دراو:</span>
              <span className="font-semibold text-success">{formatCurrency(student.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">کۆی ماوە:</span>
              <span className="font-semibold text-destructive">{formatCurrency(student.totalFee - student.paidAmount)}</span>
            </div>
          </div>

          {/* Date Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("justify-start text-right", !startDate && "text-muted-foreground")}
                >
                  <Calendar className="ml-2 h-4 w-4" />
                  {startDate ? format(startDate, "yyyy/MM/dd") : "لە بەرواری"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("justify-start text-right", !endDate && "text-muted-foreground")}
                >
                  <Calendar className="ml-2 h-4 w-4" />
                  {endDate ? format(endDate, "yyyy/MM/dd") : "بۆ بەرواری"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {(startDate || endDate) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 ml-1" />
                پاککردنەوە
              </Button>
            )}
          </div>

          {/* Payments List */}
          <ScrollArea className="h-[300px]">
            {filteredPayments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{student.payments.length === 0 ? 'هیچ پارەدانێک تۆمار نەکراوە' : 'هیچ پارەدانێک لەم ماوەیە نەدۆزرایەوە'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPayments
                  .map((payment, index) => {
                    const paymentIndex = student.payments.findIndex(p => p.id === payment.id) + 1;
                    return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-card border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-success">
                            {formatCurrency(payment.amount)}
                          </span>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            #{paymentIndex}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(payment.date).toLocaleDateString('ku-IQ')}
                        </div>
                        {payment.note && (
                          <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                            {payment.note}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint(payment)}
                        className="shrink-0"
                      >
                        <Printer className="h-4 w-4 ml-1" />
                        چاپ
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
