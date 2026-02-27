import { Student, Payment, formatCurrency, getDepartmentInfo } from '@/types';
import ntiLogo from '@/assets/nti-logo.jpg';
import { format } from 'date-fns';

interface InvoicePrintProps {
  student: Student;
  payment: Payment;
}

function MiniReceipt({ student, payment, copyLabel }: { student: Student; payment: Payment; copyLabel: string }) {
  const department = getDepartmentInfo(student.department);
  const remainingAfterPayment = student.totalFee - (student.paidAmount + payment.amount);

  return (
    <div className="border-2 border-gray-800 rounded-md p-3 relative" style={{ fontSize: '10px', lineHeight: '1.4' }}>
      {/* Copy Label */}
      <div className="absolute top-1 left-1 bg-gray-800 text-white px-2 py-0.5 rounded text-[8px] font-bold">
        {copyLabel}
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-400 pb-2 mb-2">
        <img src={ntiLogo} alt="NTI" className="h-8 w-8 object-contain rounded" />
        <div className="flex-1">
          <h2 className="font-bold text-[11px] text-gray-900">پەیمانگای تەکنیکی نیشتمانی</h2>
          <p className="text-[8px] text-gray-500">National Technical Institute</p>
        </div>
        <div className="text-left">
          <p className="text-[8px] text-gray-500">پسولەی پارەدان</p>
          <code className="text-[9px] font-bold text-gray-800">#{payment.id.slice(0, 8).toUpperCase()}</code>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-2">
        <div className="flex justify-between">
          <span className="text-gray-500">ناو:</span>
          <span className="font-bold text-gray-900">{student.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">بەروار:</span>
          <span className="font-semibold">{format(new Date(payment.date), 'yyyy/MM/dd')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">بەش:</span>
          <span>{department.icon} {department.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">مۆبایل:</span>
          <span dir="ltr">{student.phone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">ژوور/ساڵ:</span>
          <span>{student.room} - ساڵی {student.year}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">کۆد:</span>
          <span className="font-mono font-bold">{student.code}</span>
        </div>
      </div>

      {/* Payment Table */}
      <table className="w-full border-collapse mb-2">
        <tbody>
          <tr className="border border-gray-300">
            <td className="p-1 bg-gray-100 font-semibold">کرێی ساڵانە</td>
            <td className="p-1 text-left">{formatCurrency(student.totalFee)}</td>
          </tr>
          <tr className="border border-gray-300">
            <td className="p-1 bg-gray-100 font-semibold">کۆی دراو پێشتر</td>
            <td className="p-1 text-left text-green-700 font-semibold">{formatCurrency(student.paidAmount)}</td>
          </tr>
          <tr className="border-2 border-gray-800 bg-green-50">
            <td className="p-1.5 font-bold text-[11px]">بڕی ئەم پارەدانە</td>
            <td className="p-1.5 text-left font-bold text-[12px] text-green-700">{formatCurrency(payment.amount)}</td>
          </tr>
          <tr className="border border-gray-300">
            <td className="p-1 font-semibold">ماوەی قەرز</td>
            <td className={`p-1 text-left font-bold ${remainingAfterPayment > 0 ? 'text-red-600' : 'text-green-700'}`}>
              {formatCurrency(remainingAfterPayment)}
            </td>
          </tr>
        </tbody>
      </table>

      {payment.note && (
        <p className="text-[9px] text-gray-500 mb-1.5">تێبینی: {payment.note}</p>
      )}

      {/* Signatures */}
      <div className="flex justify-between items-end pt-1 border-t border-gray-300">
        <div className="text-center">
          <div className="w-20 border-b border-gray-400 mb-0.5 mt-3"></div>
          <p className="text-[8px] text-gray-500">واژووی وەرگر</p>
        </div>
        <div className="text-center">
          <div className="w-20 border-b border-gray-400 mb-0.5 mt-3"></div>
          <p className="text-[8px] text-gray-500">واژووی ژمێریاری</p>
        </div>
      </div>
    </div>
  );
}

export function InvoicePrint({ student, payment }: InvoicePrintProps) {
  const copyLabels = ['نوسخەی قوتابی', 'نوسخەی ژمێریاری', 'نوسخەی بەشەکە', 'نوسخەی ئەرشیف'];

  return (
    <div className="bg-white p-4" style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }} dir="rtl">
      <div className="grid grid-cols-2 gap-3">
        {copyLabels.map((label, i) => (
          <MiniReceipt key={i} student={student} payment={payment} copyLabel={label} />
        ))}
      </div>
    </div>
  );
}
