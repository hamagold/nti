import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { useStore } from '@/store/useStore';
import { formatCurrency, getDepartmentInfo } from '@/types';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Search, Receipt, FileText, Eye, Loader2 } from 'lucide-react';
import { InvoiceViewDialog } from '@/components/invoices/InvoiceViewDialog';
import { useTranslation } from '@/hooks/useTranslation';

interface PaymentWithStudent {
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

export default function Invoices() {
  const { students, studentsLoading } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithStudent | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const { t } = useTranslation();

  // Get all payments with student info
  const allPayments: PaymentWithStudent[] = students
    .flatMap((student) =>
      student.payments.map((payment) => ({
        ...payment,
        studentName: student.name,
        studentPhone: student.phone,
        department: student.department,
        room: student.room,
        year: student.year,
        totalFee: student.totalFee,
        totalPaid: student.paidAmount,
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredPayments = allPayments.filter((payment) =>
    payment.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAmount = allPayments.reduce((sum, p) => sum + p.amount, 0);

  const handleViewInvoice = (payment: PaymentWithStudent) => {
    setSelectedPayment(payment);
    setViewOpen(true);
  };

  // Get translated department name
  const getDeptName = (deptId: string) => {
    const deptKey = `departments.${deptId}` as const;
    return t(deptKey);
  };

  if (studentsLoading) {
    return (
      <div className="min-h-screen pb-8">
        <Header
          title={t('invoices.title')}
          subtitle={t('invoices.subtitle')}
        />
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t('invoices.loadingData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <Header
        title={t('invoices.title')}
        subtitle={t('invoices.subtitle')}
      />

      <div className="p-8">
        {/* Stats */}
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <div className="rounded-2xl bg-card p-6 shadow-lg animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                <Receipt className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('invoices.totalInvoices')}</p>
                <p className="text-2xl font-bold text-foreground">
                  {allPayments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-lg animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl gradient-secondary flex items-center justify-center">
                <FileText className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('invoices.totalRevenue')}</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('invoices.searchStudent')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-card"
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-card shadow-lg overflow-hidden animate-slide-up">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-right">{t('invoices.invoiceNumber')}</TableHead>
                <TableHead className="text-right">{t('invoices.student')}</TableHead>
                <TableHead className="text-right">{t('invoices.department')}</TableHead>
                <TableHead className="text-right">{t('invoices.amount')}</TableHead>
                <TableHead className="text-right">{t('invoices.date')}</TableHead>
                <TableHead className="text-right">{t('invoices.note')}</TableHead>
                <TableHead className="text-right">{t('invoices.action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Receipt className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground">{t('invoices.noInvoices')}</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment, index) => {
                  const dept = getDepartmentInfo(payment.department as any);
                  return (
                    <TableRow
                      key={payment.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          #{payment.id.slice(0, 8).toUpperCase()}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{payment.studentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('invoices.room')} {payment.room} - {t('invoices.year')} {payment.year}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {dept.icon} {getDeptName(payment.department)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-success">
                          {formatCurrency(payment.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(payment.date), 'yyyy/MM/dd - HH:mm')}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {payment.note || '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewInvoice(payment)}
                        >
                          <Eye className="h-4 w-4 ml-1" />
                          {t('invoices.view')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Invoice View Dialog */}
      <InvoiceViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        payment={selectedPayment}
      />
    </div>
  );
}