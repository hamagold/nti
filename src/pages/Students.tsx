import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { StudentForm } from '@/components/students/StudentForm';
import { StudentCard } from '@/components/students/StudentCard';
import { PaymentDialog } from '@/components/payments/PaymentDialog';
import { PaymentHistoryDialog } from '@/components/students/PaymentHistoryDialog';
import { YearProgressDialog } from '@/components/students/YearProgressDialog';
import { useStore } from '@/store/useStore';
import { usePermissions } from '@/hooks/usePermissions';
import { Student, DEPARTMENTS, ROOMS, YEARS, Department, Room, Year } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PasswordConfirmDialog } from '@/components/common/PasswordConfirmDialog';
import { toast } from 'sonner';
import { Plus, Search, GraduationCap, Loader2 } from 'lucide-react';

export default function Students() {
  const { students, deleteStudent, studentsLoading } = useStore();
  const { canAdd, canEdit, canDelete, isAdmin } = usePermissions();
  const [formOpen, setFormOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | undefined>();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [historyStudent, setHistoryStudent] = useState<Student | null>(null);
  const [progressStudent, setProgressStudent] = useState<Student | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone.includes(searchQuery) ||
      student.code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept =
      filterDept === 'all' || student.department === filterDept;
    const matchesRoom = filterRoom === 'all' || student.room === filterRoom;
    const matchesYear =
      filterYear === 'all' || student.year.toString() === filterYear;
    
    // Payment status filter
    const remaining = student.totalFee - student.paidAmount;
    const matchesPaymentStatus = 
      filterPaymentStatus === 'all' ||
      (filterPaymentStatus === 'unpaid' && remaining > 0) ||
      (filterPaymentStatus === 'paid' && remaining <= 0);
    
    return matchesSearch && matchesDept && matchesRoom && matchesYear && matchesPaymentStatus;
  });

  const handleEdit = (student: Student) => {
    setEditStudent(student);
    setFormOpen(true);
  };

  const handlePayment = (student: Student) => {
    setSelectedStudent(student);
    setPaymentOpen(true);
  };

  const handleViewHistory = (student: Student) => {
    setHistoryStudent(student);
    setHistoryOpen(true);
  };

  const handleProgressYear = (student: Student) => {
    setProgressStudent(student);
    setProgressOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteStudent(deleteId);
      toast.success('قوتابی سڕایەوە');
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen pb-8">
      <Header
        title="قوتابیان"
        subtitle={`${students.length} قوتابی تۆمارکراو`}
      />

      <div className="p-8">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 mb-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="گەڕان بە ناو، کۆد، یان ژمارە..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-card"
              />
            </div>

            {/* Filters */}
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-[140px] bg-card">
                <SelectValue placeholder="بەش" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">هەموو بەشەکان</SelectItem>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.icon} {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterRoom} onValueChange={setFilterRoom}>
              <SelectTrigger className="w-[120px] bg-card">
                <SelectValue placeholder="ژوور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">هەموو ژوورەکان</SelectItem>
                {ROOMS.map((room) => (
                  <SelectItem key={room} value={room}>
                    ژووری {room}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-[120px] bg-card">
                <SelectValue placeholder="ساڵ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">هەموو ساڵەکان</SelectItem>
                {YEARS.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    ساڵی {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPaymentStatus} onValueChange={setFilterPaymentStatus}>
              <SelectTrigger className="w-[140px] bg-card">
                <SelectValue placeholder="بارودۆخی پارەدان" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">هەموو</SelectItem>
                <SelectItem value="unpaid">قەرزدار</SelectItem>
                <SelectItem value="paid">تەواوکردوو</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {canAdd('student') && (
            <Button
              onClick={() => {
                setEditStudent(undefined);
                setFormOpen(true);
              }}
              className="gradient-primary text-primary-foreground shrink-0"
            >
              <Plus className="h-5 w-5 ml-2" />
              قوتابی نوێ
            </Button>
          )}
        </div>

        {/* Students Grid */}
        {studentsLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">بارکردنی قوتابیان...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <GraduationCap className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">هیچ قوتابیەک نەدۆزرایەوە</p>
            <p className="text-sm">قوتابیەکی نوێ زیاد بکە یان فلتەرەکان بگۆڕە</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredStudents.map((student, index) => (
              <StudentCard
                key={student.id}
                student={student}
                onEdit={canEdit('student') ? handleEdit : undefined}
                onDelete={canDelete('student') ? (id) => setDeleteId(id) : undefined}
                onPayment={canAdd('payment') ? handlePayment : undefined}
                onViewHistory={handleViewHistory}
                onProgressYear={canEdit('student') ? handleProgressYear : undefined}
                delay={index * 50}
                isViewOnly={isAdmin}
              />
            ))}
          </div>
        )}
      </div>

      {/* Student Form Dialog */}
      <StudentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editStudent={editStudent}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        student={selectedStudent}
      />

      {/* Payment History Dialog */}
      <PaymentHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        student={historyStudent}
      />

      {/* Year Progress Dialog */}
      <YearProgressDialog
        open={progressOpen}
        onOpenChange={setProgressOpen}
        student={progressStudent}
      />

      {/* Password Confirmation for Delete */}
      <PasswordConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="سڕینەوەی قوتابی"
        description="ئەم کردارە ناگەڕێتەوە. تکایە پاسۆردی ئەدمین بنوسە بۆ دڵنیابوون."
      />
    </div>
  );
}
