export type Department = 'computer' | 'patrol' | 'accounting' | 'administrator';
export type Room = 'A' | 'B' | 'C';
export type Year = 1 | 2 | 3 | 4 | 5;

export interface Student {
  id: string;
  name: string;
  phone: string;
  address: string;
  photo?: string;
  department: Department;
  room: Room;
  year: Year;
  totalFee: number;
  paidAmount: number;
  registrationDate: string;
  payments: Payment[];
}

export interface Payment {
  id: string;
  studentId: string;
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
}

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
  return new Intl.NumberFormat('ar-IQ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' دینار';
};

export const getDepartmentInfo = (id: Department): DepartmentInfo => {
  return DEPARTMENTS.find(d => d.id === id) || DEPARTMENTS[0];
};
