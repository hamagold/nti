import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Student, Payment, Staff, Expense } from '@/types';

interface AppState {
  students: Student[];
  staff: Staff[];
  expenses: Expense[];
  
  // Student actions
  addStudent: (student: Student) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  addPayment: (studentId: string, payment: Payment) => void;
  
  // Staff actions
  addStaff: (staff: Staff) => void;
  updateStaff: (id: string, staff: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  
  // Expense actions
  addExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      students: [],
      staff: [],
      expenses: [],
      
      addStudent: (student) =>
        set((state) => ({ students: [...state.students, student] })),
      
      updateStudent: (id, updatedStudent) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id ? { ...s, ...updatedStudent } : s
          ),
        })),
      
      deleteStudent: (id) =>
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
        })),
      
      addPayment: (studentId, payment) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.id === studentId
              ? {
                  ...s,
                  payments: [...s.payments, payment],
                  paidAmount: s.paidAmount + payment.amount,
                }
              : s
          ),
        })),
      
      addStaff: (staff) =>
        set((state) => ({ staff: [...state.staff, staff] })),
      
      updateStaff: (id, updatedStaff) =>
        set((state) => ({
          staff: state.staff.map((s) =>
            s.id === id ? { ...s, ...updatedStaff } : s
          ),
        })),
      
      deleteStaff: (id) =>
        set((state) => ({
          staff: state.staff.filter((s) => s.id !== id),
        })),
      
      addExpense: (expense) =>
        set((state) => ({ expenses: [...state.expenses, expense] })),
      
      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),
    }),
    {
      name: 'institute-storage',
    }
  )
);
