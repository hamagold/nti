import { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { formatCurrency, getDepartmentInfo } from '@/types';
import { format } from 'date-fns';
import { useSettingsStore } from '@/store/settingsStore';
import { useTranslation } from '@/hooks/useTranslation';
import ntiLogo from '@/assets/nti-logo.jpg';

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

function MiniInvoice({ payment, copyLabel, contactInfo, t, getDeptName }: {
  payment: InvoicePayment;
  copyLabel: string;
  contactInfo: any;
  t: (key: string) => string;
  getDeptName: (id: string) => string;
}) {
  const dept = getDepartmentInfo(payment.department as any);
  const remaining = payment.totalFee - payment.totalPaid;

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
          <span className="font-bold text-gray-900">{payment.studentName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">بەروار:</span>
          <span className="font-semibold">{format(new Date(payment.date), 'yyyy/MM/dd')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">بەش:</span>
          <span>{dept.icon} {getDeptName(payment.department)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">مۆبایل:</span>
          <span dir="ltr">{payment.studentPhone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">ژوور/ساڵ:</span>
          <span>{payment.room} - ساڵی {payment.year}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">کات:</span>
          <span>{format(new Date(payment.date), 'HH:mm')}</span>
        </div>
      </div>

      {/* Payment Table */}
      <table className="w-full border-collapse mb-2">
        <tbody>
          <tr className="border border-gray-300">
            <td className="p-1 bg-gray-100 font-semibold">کرێی ساڵانە</td>
            <td className="p-1 text-left">{formatCurrency(payment.totalFee)}</td>
          </tr>
          <tr className="border border-gray-300">
            <td className="p-1 bg-gray-100 font-semibold">کۆی دراو</td>
            <td className="p-1 text-left text-green-700 font-semibold">{formatCurrency(payment.totalPaid)}</td>
          </tr>
          <tr className="border-2 border-gray-800 bg-green-50">
            <td className="p-1.5 font-bold text-[11px]">بڕی ئەم پارەدانە</td>
            <td className="p-1.5 text-left font-bold text-[12px] text-green-700">{formatCurrency(payment.amount)}</td>
          </tr>
          <tr className="border border-gray-300">
            <td className="p-1 font-semibold">ماوە</td>
            <td className={`p-1 text-left font-bold ${remaining > 0 ? 'text-red-600' : 'text-green-700'}`}>
              {formatCurrency(remaining)}
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
        <div className="text-center text-[7px] text-gray-400">
          {contactInfo.phone}
        </div>
        <div className="text-center">
          <div className="w-20 border-b border-gray-400 mb-0.5 mt-3"></div>
          <p className="text-[8px] text-gray-500">واژووی ژمێریاری</p>
        </div>
      </div>
    </div>
  );
}

export function InvoiceViewDialog({ open, onOpenChange, payment }: InvoiceViewDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { contactInfo } = useSettingsStore();
  const { t } = useTranslation();
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  if (!payment) return null;

  const getDeptName = (deptId: string) => {
    const deptKey = `departments.${deptId}` as const;
    return t(deptKey);
  };

  const copyLabels = ['نوسخەی قوتابی', 'نوسخەی ژمێریاری', 'نوسخەی بەشەکە', 'نوسخەی ئەرشیف'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t('invoices.paymentReceipt')}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handlePrint()}>
                <Printer className="h-4 w-4 ml-2" />
                {t('invoices.print')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Printable - 4 copies on one page */}
        <div ref={printRef} className="bg-white p-4 print:p-2" dir="rtl" style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}>
          <div className="grid grid-cols-2 gap-3 print:gap-2" style={{ maxHeight: '100%' }}>
            {copyLabels.map((label, i) => (
              <MiniInvoice
                key={i}
                payment={payment}
                copyLabel={label}
                contactInfo={contactInfo}
                t={t}
                getDeptName={getDeptName}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
