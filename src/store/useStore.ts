import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Student, Payment, Staff, Expense, SalaryPayment, Year, YearPayment } from '@/types';
import { useSettingsStore } from './settingsStore';

interface AppState {
  students: Student[];
  staff: Staff[];
  expenses: Expense[];
  
  // Student actions
  addStudent: (student: Student) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  addPayment: (studentId: string, payment: Payment) => void;
  progressToNextYear: (studentId: string, newFee?: number) => boolean;
  
  // Staff actions
  addStaff: (staff: Staff) => void;
  updateStaff: (id: string, staff: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  addSalaryPayment: (staffId: string, payment: SalaryPayment) => void;
  
  // Expense actions
  addExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      students: [],
      staff: [],
      expenses: [],
      
      addStudent: (student) =>
        set((state) => ({ 
          students: [...state.students, {
            ...student,
            yearPayments: [{
              year: student.year,
              totalFee: student.totalFee,
              paidAmount: 0,
              isCompleted: false,
            }]
          }] 
        })),
      
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
          students: state.students.map((s) => {
            if (s.id !== studentId) return s;
            
            const newPaidAmount = s.paidAmount + payment.amount;
            const yearPayments = s.yearPayments || [{
              year: s.year,
              totalFee: s.totalFee,
              paidAmount: s.paidAmount,
              isCompleted: false,
            }];
            
            // Update current year payment
            const updatedYearPayments = yearPayments.map(yp => 
              yp.year === s.year 
                ? { ...yp, paidAmount: newPaidAmount, isCompleted: newPaidAmount >= yp.totalFee }
                : yp
            );
            
            return {
              ...s,
              payments: [...s.payments, payment],
              paidAmount: newPaidAmount,
              yearPayments: updatedYearPayments,
            };
          }),
        })),

      progressToNextYear: (studentId, customFee) => {
        const student = get().students.find(s => s.id === studentId);
        if (!student) return false;
        
        // Check if current year is completed
        if (student.paidAmount < student.totalFee) return false;
        
        // Check if already at year 5
        if (student.year >= 5) return false;
        
        const { departments } = useSettingsStore.getState();
        const dept = departments.find(d => d.id === student.department);
        // Use custom fee if provided, otherwise use department fee or current fee
        const nextYearFee = customFee ?? dept?.yearlyFee ?? student.totalFee;
        const nextYear = (student.year + 1) as Year;
        
        set((state) => ({
          students: state.students.map((s) => {
            if (s.id !== studentId) return s;
            
            const yearPayments = s.yearPayments || [];
            yearPayments.push({
              year: nextYear,
              totalFee: nextYearFee,
              paidAmount: 0,
              isCompleted: false,
            });
            
            return {
              ...s,
              year: nextYear,
              totalFee: nextYearFee,
              paidAmount: 0,
              yearPayments,
            };
          }),
        }));
        
        useSettingsStore.getState().addActivityLog({
          type: 'year_progress',
          description: `قوتابی ${student.name} پەڕییەوە بۆ ساڵی ${nextYear}`,
          user: 'سیستەم',
        });
        
        return true;
      },
      
      addStaff: (staff) =>
        set((state) => ({ staff: [...state.staff, { ...staff, salaryPayments: staff.salaryPayments || [] }] })),
      
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

      addSalaryPayment: (staffId, payment) =>
        set((state) => ({
          staff: state.staff.map((s) =>
            s.id === staffId
              ? {
                  ...s,
                  salaryPayments: [...(s.salaryPayments || []), payment],
                }
              : s
          ),
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
