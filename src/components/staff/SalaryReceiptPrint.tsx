import { Staff, SalaryPayment, formatCurrency, getDepartmentInfo, MONTHS } from '@/types';
import ntiLogo from '@/assets/nti-logo.jpg';

interface SalaryReceiptPrintProps {
  staff: Staff;
  payment: SalaryPayment;
}

export function SalaryReceiptPrint({ staff, payment }: SalaryReceiptPrintProps) {
  const department = staff.department ? getDepartmentInfo(staff.department) : null;
  const monthName = MONTHS.find(m => m.id === payment.month)?.name || '';

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
            <p className="text-lg font-bold text-foreground">پسولەی مووچە</p>
            <p className="text-sm text-muted-foreground">Salary Receipt</p>
          </div>
        </div>
      </div>

      {/* Staff Info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-muted/30 rounded-xl p-4">
          <h3 className="font-bold text-foreground mb-3 border-b pb-2">زانیاری ستاف</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ناو:</span>
              <span className="font-semibold">{staff.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ژمارەی مۆبایل:</span>
              <span>{staff.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ڕۆڵ:</span>
              <span>{staff.role === 'teacher' ? 'مامۆستا' : 'کارمەند'}</span>
            </div>
            {department && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">بەش:</span>
                <span>{department.icon} {department.name}</span>
              </div>
            )}
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
              <span className="text-muted-foreground">بۆ مانگی:</span>
              <span className="font-bold text-primary">{monthName} - {payment.year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">بەرواری پارەدان:</span>
              <span>{new Date(payment.date).toLocaleDateString('ar-IQ')}</span>
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
              <td className="py-3 px-4">مووچەی مانگانە</td>
              <td className="py-3 px-4 text-left">{formatCurrency(staff.salary)}</td>
            </tr>
            <tr className="border-t border-border bg-success/10">
              <td className="py-3 px-4 font-bold text-success">بڕی پارەدراو بۆ {monthName}</td>
              <td className="py-3 px-4 text-left font-bold text-success text-lg">
                {formatCurrency(payment.amount)}
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
          سوپاس بۆ هاوکاریەکانتان لە پەیمانگای تەکنیکی نیشتمانی
        </p>
      </div>
    </div>
  );
}