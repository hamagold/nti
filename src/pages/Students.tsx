import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { StudentForm } from '@/components/students/StudentForm';
import { StudentCard } from '@/components/students/StudentCard';
import { PaymentDialog } from '@/components/payments/PaymentDialog';
import { useStore } from '@/store/useStore';
import { Student, DEPARTMENTS, ROOMS, YEARS, Department, Room, Year } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Search, GraduationCap } from 'lucide-react';

export default function Students() {
  const { students, deleteStudent } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | undefined>();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');

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
    return matchesSearch && matchesDept && matchesRoom && matchesYear;
  });

  const handleEdit = (student: Student) => {
    setEditStudent(student);
    setFormOpen(true);
  };

  const handlePayment = (student: Student) => {
    setSelectedStudent(student);
    setPaymentOpen(true);
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
          </div>

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
        </div>

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
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
                onEdit={handleEdit}
                onDelete={(id) => setDeleteId(id)}
                onPayment={handlePayment}
                delay={index * 50}
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>دڵنیایی لە سڕینەوە؟</AlertDialogTitle>
            <AlertDialogDescription>
              ئەم کردارە ناگەڕێتەوە. هەموو زانیاریەکانی قوتابی دەسڕێتەوە.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>پاشگەزبوونەوە</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              سڕینەوە
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
