export type Department = 'computer' | 'patrol' | 'accounting' | 'administrator';
export type Room = 'A' | 'B' | 'C';
export type Year = 1 | 2 | 3 | 4 | 5;

export interface YearPayment {
  year: Year;
  totalFee: number;
  paidAmount: number;
  isCompleted: boolean;
}

export interface Student {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  photo?: string;
  department: Department;
  room: Room;
  year: Year; // Current active year
  totalFee: number; // Current year fee
  paidAmount: number; // Current year paid
  registrationDate: string;
  payments: Payment[];
  yearPayments?: YearPayment[]; // Track all 5 years
}

// Generate student code: NTI-DEPT-YEAR-NUMBER
export const generateStudentCode = (department: Department, year: Year, existingStudents: Student[]): string => {
  const deptCode = department.substring(0, 3).toUpperCase();
  const yearStr = year.toString().padStart(2, '0');
  const sameTypeStudents = existingStudents.filter(
    s => s.department === department && s.year === year
  );
  const nextNum = (sameTypeStudents.length + 1).toString().padStart(3, '0');
  return `NTI-${deptCode}-${yearStr}-${nextNum}`;
};

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface SalaryPayment {
  id: string;
  staffId: string;
  month: number; // 1-12
  year: number;
  amount: number;
  date: string;
  note?: string;
}

export interface Staff {
  id: string;
  name: string;
  phone: string;
  role: 'teacher' | 'employee';
  department?: Department;
  salary: number;
  joinDate: string;
  salaryPayments: SalaryPayment[];
}

export const MONTHS = [
  { id: 1, name: 'کانوونی دووەم' },
  { id: 2, name: 'شوبات' },
  { id: 3, name: 'ئازار' },
  { id: 4, name: 'نیسان' },
  { id: 5, name: 'ئایار' },
  { id: 6, name: 'حوزەیران' },
  { id: 7, name: 'تەمووز' },
  { id: 8, name: 'ئاب' },
  { id: 9, name: 'ئەیلوول' },
  { id: 10, name: 'تشرینی یەکەم' },
  { id: 11, name: 'تشرینی دووەم' },
  { id: 12, name: 'کانوونی یەکەم' },
];

export interface Expense {
  id: string;
  type: 'electricity' | 'water' | 'other';
  amount: number;
  date: string;
  note?: string;
}

export interface DepartmentInfo {
  id: Department;
  name: string;
  icon: string;
  yearlyFee: number;
  color: string;
}

export const DEPARTMENTS: DepartmentInfo[] = [
  { id: 'computer', name: 'کۆمپیوتەر', icon: '💻', yearlyFee: 1800000, color: 'primary' },
  { id: 'patrol', name: 'پەترۆل', icon: '⛽', yearlyFee: 2000000, color: 'secondary' },
  { id: 'accounting', name: 'ژمێریاری', icon: '📊', yearlyFee: 1600000, color: 'accent' },
  { id: 'administrator', name: 'کارگێڕی', icon: '🏢', yearlyFee: 1700000, color: 'info' },
];

export const ROOMS: Room[] = ['A', 'B', 'C'];
export const YEARS: Year[] = [1, 2, 3, 4, 5];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' دینار';
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const getDepartmentInfo = (id: Department): DepartmentInfo => {
  return DEPARTMENTS.find(d => d.id === id) || DEPARTMENTS[0];
};
