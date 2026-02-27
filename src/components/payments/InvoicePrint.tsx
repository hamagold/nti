import { Student, Payment, formatCurrency, getDepartmentInfo } from '@/types';
import ntiLogo from '@/assets/nti-logo.jpg';

interface InvoicePrintProps {
  student: Student;
  payment: Payment;
}

export function InvoicePrint({ student, payment }: InvoicePrintProps) {
  const department = getDepartmentInfo(student.department);
  const remainingAfterPayment = student.totalFee - (student.paidAmount + payment.amount);

  return (
    <div className="bg-white p-8 max-w-[210mm] mx-auto" style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }} dir="rtl">
      {/* Header with Logo */}
      <div className="border-b-4 border-primary pb-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={ntiLogo} 
              alt="NTI Logo" 
              className="h-20 w-20 object-contain rounded-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-primary">پەیمانگای تەکنیکی نیشتمانی</h1>
              <p className="text-sm text-muted-foreground">National Technical Institute</p>
              <p className="text-xs text-muted-foreground mt-1">2013</p>
            </div>
          </div>
          <div className="text-left">
            <p className="text-lg font-bold text-foreground">پسولەی پارەدان</p>
            <p className="text-sm text-muted-foreground">Payment Receipt</p>
          </div>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-muted/30 rounded-xl p-4">
          <h3 className="font-bold text-foreground mb-3 border-b pb-2">زانیاری قوتابی</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">کۆد:</span>
              <span className="font-mono font-bold text-primary">{student.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ناو:</span>
              <span className="font-semibold">{student.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ژمارەی مۆبایل:</span>
              <span>{student.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">بەش:</span>
              <span>{department.icon} {department.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ژوور:</span>
              <span>ژووری {student.room}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ساڵ:</span>
              <span>ساڵی {student.year}</span>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 rounded-xl p-4">
          <h3 className="font-bold text-foreground mb-3 border-b pb-2">زانیاری پسولە</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ژمارەی پسولە:</span>
              <span className="font-mono">{payment.id.substring(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">بەروار:</span>
              <span>{new Date(payment.date).toLocaleDateString('ar-IQ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">کات:</span>
              <span>{new Date(payment.date).toLocaleTimeString('ar-IQ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="border-2 border-primary/20 rounded-xl overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-primary/10">
            <tr>
              <th className="py-3 px-4 text-right font-bold">وەسف</th>
              <th className="py-3 px-4 text-left font-bold">بڕ</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <td className="py-3 px-4">کرێی خوێندن (سالانە)</td>
              <td className="py-3 px-4 text-left">{formatCurrency(student.totalFee)}</td>
            </tr>
            <tr className="border-t border-border">
              <td className="py-3 px-4">کۆی پارەدراو پێشتر</td>
              <td className="py-3 px-4 text-left">{formatCurrency(student.paidAmount)}</td>
            </tr>
            <tr className="border-t border-border bg-success/10">
              <td className="py-3 px-4 font-bold text-success">بڕی پارەدانی ئێستا</td>
              <td className="py-3 px-4 text-left font-bold text-success text-lg">
                {formatCurrency(payment.amount)}
              </td>
            </tr>
            <tr className="border-t-2 border-primary">
              <td className="py-3 px-4 font-bold">ماوەی قەرز</td>
              <td className={`py-3 px-4 text-left font-bold text-lg ${remainingAfterPayment > 0 ? 'text-destructive' : 'text-success'}`}>
                {formatCurrency(remainingAfterPayment)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Note */}
      {payment.note && (
        <div className="bg-muted/30 rounded-xl p-4 mb-6">
          <h4 className="font-bold mb-2">تێبینی:</h4>
          <p className="text-sm text-muted-foreground">{payment.note}</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-dashed border-muted pt-6 mt-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            <p>واژووی وەرگر:</p>
            <div className="mt-6 w-40 border-b border-foreground"></div>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>واژووی ژمێریاری:</p>
            <div className="mt-6 w-40 border-b border-foreground"></div>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-8">
          سوپاس بۆ متمانەکەتان بە پەیمانگای تەکنیکی نیشتمانی
        </p>
      </div>
    </div>
  );
}
