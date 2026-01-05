import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { PaymentDialog } from '@/components/payments/PaymentDialog';
import { useStore } from '@/store/useStore';
import { Student, formatCurrency, getDepartmentInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Search, CreditCard, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function Payments() {
  const { students, studentsLoading } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Get students with debt
  const studentsWithDebt = students
    .filter((s) => s.totalFee - s.paidAmount > 0)
    .sort((a, b) => (b.totalFee - b.paidAmount) - (a.totalFee - a.paidAmount));

  const filteredStudents = studentsWithDebt.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDebt = studentsWithDebt.reduce(
    (sum, s) => sum + (s.totalFee - s.paidAmount),
    0
  );

  const handlePayment = (student: Student) => {
    setSelectedStudent(student);
    setPaymentOpen(true);
  };

  if (studentsLoading) {
    return (
      <div className="min-h-screen pb-8">
        <Header
          title="پارەدان"
          subtitle="بەڕێوەبردنی پارەدان و قەرزەکان"
        />
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">بارکردنی داتا...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <Header
        title="پارەدان"
        subtitle="بەڕێوەبردنی پارەدان و قەرزەکان"
      />

      <div className="p-8">
        {/* Stats */}
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <div className="rounded-2xl bg-card p-6 shadow-lg animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">کۆی قەرزەکان</p>
                <p className="text-2xl font-bold text-warning">
                  {formatCurrency(totalDebt)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-lg animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">قوتابی قەرزدار</p>
                <p className="text-2xl font-bold text-foreground">
                  {studentsWithDebt.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-lg animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تەواوکەر</p>
                <p className="text-2xl font-bold text-foreground">
                  {students.length - studentsWithDebt.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="گەڕان بۆ قوتابی..."
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
                <TableHead className="text-right">قوتابی</TableHead>
                <TableHead className="text-right">بەش</TableHead>
                <TableHead className="text-right">کۆی کرێ</TableHead>
                <TableHead className="text-right">پارەدراو</TableHead>
                <TableHead className="text-right">ماوە</TableHead>
                <TableHead className="text-center">کردار</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground">هیچ قوتابیەکی قەرزدار نەدۆزرایەوە</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student, index) => {
                  const dept = getDepartmentInfo(student.department);
                  const remaining = student.totalFee - student.paidAmount;
                  const percentage = (student.paidAmount / student.totalFee) * 100;

                  return (
                    <TableRow
                      key={student.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                            {student.photo ? (
                              <img
                                src={student.photo}
                                alt={student.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-lg">👤</span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ژووری {student.room} - ساڵی {student.year}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {dept.icon} {dept.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(student.totalFee)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-success">
                            {formatCurrency(student.paidAmount)}
                          </p>
                          <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-success transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-destructive">
                          {formatCurrency(remaining)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          onClick={() => handlePayment(student)}
                          className="gradient-primary text-primary-foreground"
                        >
                          <CreditCard className="h-4 w-4 ml-1" />
                          پارەدان
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

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        student={selectedStudent}
      />
    </div>
  );
}
