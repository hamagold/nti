import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Student, Payment, Year, YearPayment, Department, Room, generateStudentCode } from '@/types';
import { toast } from 'sonner';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { StudentSchema, PaymentSchema, validateInput } from '@/lib/validations';
type DbStudent = Tables<'students'>;
type DbPayment = Tables<'payments'>;
type DbYearPayment = Tables<'year_payments'>;

// Convert database student to app student
const mapDbToStudent = (
  dbStudent: DbStudent,
  payments: DbPayment[],
  yearPayments: DbYearPayment[]
): Student => ({
  id: dbStudent.id,
  code: dbStudent.code,
  name: dbStudent.name,
  phone: dbStudent.phone,
  address: dbStudent.address || '',
  photo: dbStudent.photo_url || undefined,
  department: dbStudent.department as Department,
  room: dbStudent.room as Room,
  year: dbStudent.year as Year,
  totalFee: Number(dbStudent.total_fee),
  paidAmount: Number(dbStudent.paid_amount),
  registrationDate: dbStudent.registration_date,
  payments: payments.map(p => ({
    id: p.id,
    studentId: p.student_id,
    amount: Number(p.amount),
    date: p.date,
    note: p.note || undefined,
  })),
  yearPayments: yearPayments.map(yp => ({
    year: yp.year as Year,
    totalFee: Number(yp.total_fee),
    paidAmount: Number(yp.paid_amount),
    isCompleted: yp.is_completed,
  })),
});

export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch payments and year_payments for all students
      const studentIds = students.map(s => s.id);
      
      const [paymentsRes, yearPaymentsRes] = await Promise.all([
        supabase.from('payments').select('*').in('student_id', studentIds),
        supabase.from('year_payments').select('*').in('student_id', studentIds),
      ]);

      if (paymentsRes.error) throw paymentsRes.error;
      if (yearPaymentsRes.error) throw yearPaymentsRes.error;

      return students.map(s => mapDbToStudent(
        s,
        paymentsRes.data.filter(p => p.student_id === s.id),
        yearPaymentsRes.data.filter(yp => yp.student_id === s.id)
      ));
    },
  });
}

export function useAddStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (student: Omit<Student, 'id' | 'payments' | 'yearPayments'> & { code: string }) => {
      // Validate input
      const validation = validateInput(StudentSchema, student);
      if (!validation.success) {
        throw new Error((validation as { success: false; errors: string[] }).errors.join(', '));
      }
      const validData = (validation as { success: true; data: typeof student }).data;

      const { data, error } = await supabase
        .from('students')
        .insert({
          code: validData.code,
          name: validData.name.trim(),
          phone: validData.phone.trim(),
          address: validData.address?.trim() || null,
          photo_url: validData.photo || null,
          department: validData.department,
          room: validData.room,
          year: validData.year,
          total_fee: validData.totalFee,
          paid_amount: 0,
          registration_date: validData.registrationDate,
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial year payment record
      const { error: ypError } = await supabase
        .from('year_payments')
        .insert({
          student_id: data.id,
          year: student.year,
          total_fee: student.totalFee,
          paid_amount: 0,
          is_completed: false,
        });

      if (ypError) throw ypError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('قوتابی بە سەرکەوتوویی تۆمار کرا');
    },
    onError: (error) => {
      console.error('Error adding student:', error);
      toast.error('هەڵە لە زیادکردنی قوتابی');
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Student> }) => {
      const dbUpdates: Partial<TablesInsert<'students'>> = {};
      
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.photo !== undefined) dbUpdates.photo_url = updates.photo;
      if (updates.department !== undefined) dbUpdates.department = updates.department;
      if (updates.room !== undefined) dbUpdates.room = updates.room;
      if (updates.year !== undefined) dbUpdates.year = updates.year;
      if (updates.totalFee !== undefined) dbUpdates.total_fee = updates.totalFee;
      if (updates.paidAmount !== undefined) dbUpdates.paid_amount = updates.paidAmount;

      const { error } = await supabase
        .from('students')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('زانیاری قوتابی نوێکرایەوە');
    },
    onError: (error) => {
      console.error('Error updating student:', error);
      toast.error('هەڵە لە نوێکردنەوەی قوتابی');
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('قوتابی سڕایەوە');
    },
    onError: (error) => {
      console.error('Error deleting student:', error);
      toast.error('هەڵە لە سڕینەوەی قوتابی');
    },
  });
}

export function useAddPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, payment }: { studentId: string; payment: Omit<Payment, 'id' | 'studentId'> }) => {
      // Validate payment input
      const validation = validateInput(PaymentSchema, payment);
      if (!validation.success) {
        throw new Error((validation as { success: false; errors: string[] }).errors.join(', '));
      }
      const validPayment = (validation as { success: true; data: typeof payment }).data;

      // Get current student data
      const { data: student, error: fetchError } = await supabase
        .from('students')
        .select('paid_amount, year, total_fee')
        .eq('id', studentId)
        .single();

      if (fetchError) throw fetchError;

      const newPaidAmount = Number(student.paid_amount) + validPayment.amount;

      // Insert payment
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          student_id: studentId,
          amount: validPayment.amount,
          date: validPayment.date,
          note: validPayment.note?.trim() || null,
        });

      if (paymentError) throw paymentError;

      // Update student paid amount
      const { error: studentError } = await supabase
        .from('students')
        .update({ paid_amount: newPaidAmount })
        .eq('id', studentId);

      if (studentError) throw studentError;

      // Update year payment
      const { error: ypError } = await supabase
        .from('year_payments')
        .update({
          paid_amount: newPaidAmount,
          is_completed: newPaidAmount >= Number(student.total_fee),
        })
        .eq('student_id', studentId)
        .eq('year', student.year);

      if (ypError) throw ypError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('پارەدان تۆمار کرا');
    },
    onError: (error) => {
      console.error('Error adding payment:', error);
      toast.error('هەڵە لە تۆمارکردنی پارەدان');
    },
  });
}

export function useProgressToNextYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, newFee }: { studentId: string; newFee: number }) => {
      // Get current student data
      const { data: student, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (fetchError) throw fetchError;

      const nextYear = (student.year + 1) as Year;

      // Create new year payment record
      const { error: ypError } = await supabase
        .from('year_payments')
        .insert({
          student_id: studentId,
          year: nextYear,
          total_fee: newFee,
          paid_amount: 0,
          is_completed: false,
        });

      if (ypError) throw ypError;

      // Update student to next year
      const { error: studentError } = await supabase
        .from('students')
        .update({
          year: nextYear,
          total_fee: newFee,
          paid_amount: 0,
        })
        .eq('id', studentId);

      if (studentError) throw studentError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('قوتابی پەڕییەوە بۆ ساڵی داهاتوو');
    },
    onError: (error) => {
      console.error('Error progressing to next year:', error);
      toast.error('هەڵە لە پەڕینەوە بۆ ساڵی داهاتوو');
    },
  });
}
