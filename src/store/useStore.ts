// This store now serves as a compatibility layer
// The actual data is fetched from Supabase via React Query hooks
// This file re-exports the hooks for easier migration

import { useStudents, useAddStudent, useUpdateStudent, useDeleteStudent, useAddPayment, useProgressToNextYear } from '@/hooks/useStudents';
import { useStaff, useAddStaff, useUpdateStaff, useDeleteStaff, useAddSalaryPayment } from '@/hooks/useStaff';
import { useExpenses, useAddExpense, useDeleteExpense } from '@/hooks/useExpenses';
import { Student, Staff, Expense, Payment, SalaryPayment, Year, generateStudentCode } from '@/types';

// Re-export hooks for easy access
export {
  useStudents,
  useAddStudent,
  useUpdateStudent,
  useDeleteStudent,
  useAddPayment,
  useProgressToNextYear,
  useStaff,
  useAddStaff,
  useUpdateStaff,
  useDeleteStaff,
  useAddSalaryPayment,
  useExpenses,
  useAddExpense,
  useDeleteExpense,
};

// Compatibility hook that mimics the old store interface
export function useStore() {
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: staff = [], isLoading: staffLoading } = useStaff();
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  
  const addStudentMutation = useAddStudent();
  const updateStudentMutation = useUpdateStudent();
  const deleteStudentMutation = useDeleteStudent();
  const addPaymentMutation = useAddPayment();
  const progressToNextYearMutation = useProgressToNextYear();
  
  const addStaffMutation = useAddStaff();
  const updateStaffMutation = useUpdateStaff();
  const deleteStaffMutation = useDeleteStaff();
  const addSalaryPaymentMutation = useAddSalaryPayment();
  
  const addExpenseMutation = useAddExpense();
  const deleteExpenseMutation = useDeleteExpense();

  return {
    // Data
    students,
    staff,
    expenses,
    
    // Loading states
    isLoading: studentsLoading || staffLoading || expensesLoading,
    studentsLoading,
    staffLoading,
    expensesLoading,

    // Student actions
    addStudent: (student: Student) => {
      addStudentMutation.mutate({
        code: student.code,
        name: student.name,
        phone: student.phone,
        address: student.address,
        photo: student.photo,
        department: student.department,
        room: student.room,
        year: student.year,
        totalFee: student.totalFee,
        paidAmount: 0,
        registrationDate: student.registrationDate,
      });
    },
    
    updateStudent: (id: string, updates: Partial<Student>) => {
      updateStudentMutation.mutate({ id, updates });
    },
    
    deleteStudent: (id: string) => {
      deleteStudentMutation.mutate(id);
    },
    
    addPayment: (studentId: string, payment: Payment) => {
      addPaymentMutation.mutate({
        studentId,
        payment: {
          amount: payment.amount,
          date: payment.date,
          note: payment.note,
        },
      });
    },
    
    progressToNextYear: (studentId: string, newFee?: number) => {
      const student = students.find(s => s.id === studentId);
      if (!student) return false;
      if (student.paidAmount < student.totalFee) return false;
      if (student.year >= 5) return false;
      
      progressToNextYearMutation.mutate({
        studentId,
        newFee: newFee ?? student.totalFee,
      });
      return true;
    },

    // Staff actions
    addStaff: (staffMember: Staff) => {
      addStaffMutation.mutate({
        name: staffMember.name,
        phone: staffMember.phone,
        role: staffMember.role,
        department: staffMember.department,
        salary: staffMember.salary,
        joinDate: staffMember.joinDate,
      });
    },
    
    updateStaff: (id: string, updates: Partial<Staff>) => {
      updateStaffMutation.mutate({ id, updates });
    },
    
    deleteStaff: (id: string) => {
      deleteStaffMutation.mutate(id);
    },
    
    addSalaryPayment: (staffId: string, payment: SalaryPayment) => {
      addSalaryPaymentMutation.mutate({
        staffId,
        payment: {
          month: payment.month,
          year: payment.year,
          amount: payment.amount,
          date: payment.date,
          note: payment.note,
        },
      });
    },

    // Expense actions
    addExpense: (expense: Expense) => {
      addExpenseMutation.mutate({
        type: expense.type,
        amount: expense.amount,
        date: expense.date,
        note: expense.note,
      });
    },
    
    deleteExpense: (id: string) => {
      deleteExpenseMutation.mutate(id);
    },
    
    // Helper to generate student code
    generateStudentCode,
  };
}
