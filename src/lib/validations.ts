import { z } from 'zod';

// ============ STUDENT VALIDATION ============
export const StudentSchema = z.object({
  name: z.string()
    .min(1, 'ناو پێویستە')
    .max(200, 'ناو دەبێت کەمتر لە ٢٠٠ پیت بێت')
    .trim(),
  phone: z.string()
    .min(1, 'ژمارەی مۆبایل پێویستە')
    .max(20, 'ژمارەی مۆبایل دەبێت کەمتر لە ٢٠ ژمارە بێت')
    .regex(/^[0-9+\-\s]+$/, 'ژمارەی مۆبایل تەنها ژمارە و + دەگرێتەوە'),
  address: z.string()
    .max(500, 'ناونیشان دەبێت کەمتر لە ٥٠٠ پیت بێت')
    .optional()
    .nullable(),
  code: z.string()
    .min(1, 'کۆد پێویستە')
    .max(50, 'کۆد دەبێت کەمتر لە ٥٠ پیت بێت'),
  department: z.enum(['computer', 'patrol', 'accounting', 'administrator'], {
    errorMap: () => ({ message: 'بەش پێویستە' }),
  }),
  room: z.enum(['A', 'B', 'C'], {
    errorMap: () => ({ message: 'ژوور پێویستە' }),
  }),
  year: z.number()
    .int('ساڵ دەبێت ژمارەی تەواو بێت')
    .min(1, 'ساڵ دەبێت لانیکەم ١ بێت')
    .max(5, 'ساڵ دەبێت زۆرینە ٥ بێت'),
  totalFee: z.number()
    .min(0, 'کۆی قیست نابێت کەمتر لە ٠ بێت')
    .max(100000000, 'کۆی قیست زۆر گەورەیە'),
  paidAmount: z.number()
    .min(0, 'بڕی پارەدان نابێت کەمتر لە ٠ بێت')
    .optional(),
  registrationDate: z.string().min(1, 'بەرواری تۆمارکردن پێویستە'),
  photo: z.string().optional().nullable(),
});

export type ValidatedStudent = z.infer<typeof StudentSchema>;

// ============ STAFF VALIDATION ============
export const StaffSchema = z.object({
  name: z.string()
    .min(1, 'ناو پێویستە')
    .max(200, 'ناو دەبێت کەمتر لە ٢٠٠ پیت بێت')
    .trim(),
  phone: z.string()
    .min(1, 'ژمارەی مۆبایل پێویستە')
    .max(20, 'ژمارەی مۆبایل دەبێت کەمتر لە ٢٠ ژمارە بێت')
    .regex(/^[0-9+\-\s]+$/, 'ژمارەی مۆبایل تەنها ژمارە و + دەگرێتەوە'),
  role: z.enum(['teacher', 'employee'], {
    errorMap: () => ({ message: 'ڕۆڵ پێویستە' }),
  }),
  department: z.union([
    z.enum(['computer', 'patrol', 'accounting', 'administrator']),
    z.literal('').transform(() => null),
    z.null(),
  ]).optional().nullable(),
  salary: z.number()
    .min(0, 'مووچە نابێت کەمتر لە ٠ بێت')
    .max(100000000, 'مووچە زۆر گەورەیە'),
  joinDate: z.string().min(1, 'بەرواری دەستپێکردن پێویستە'),
});

export type ValidatedStaff = z.infer<typeof StaffSchema>;

// ============ PAYMENT VALIDATION ============
export const PaymentSchema = z.object({
  amount: z.number()
    .positive('بڕی پارەدان دەبێت گەورەتر لە ٠ بێت')
    .max(100000000, 'بڕی پارەدان زۆر گەورەیە'),
  date: z.string().min(1, 'بەروار پێویستە'),
  note: z.string()
    .max(500, 'تێبینی دەبێت کەمتر لە ٥٠٠ پیت بێت')
    .optional()
    .nullable(),
});

export type ValidatedPayment = z.infer<typeof PaymentSchema>;

// ============ SALARY PAYMENT VALIDATION ============
export const SalaryPaymentSchema = z.object({
  month: z.number()
    .int()
    .min(1, 'مانگ دەبێت لە ١ بۆ ١٢ بێت')
    .max(12, 'مانگ دەبێت لە ١ بۆ ١٢ بێت'),
  year: z.number()
    .int()
    .min(2020, 'ساڵ دەبێت لە ٢٠٢٠ بۆ سەرەوە بێت')
    .max(2100, 'ساڵ نادروستە'),
  amount: z.number()
    .positive('بڕی مووچە دەبێت گەورەتر لە ٠ بێت')
    .max(100000000, 'بڕی مووچە زۆر گەورەیە'),
  date: z.string().min(1, 'بەروار پێویستە'),
  note: z.string()
    .max(500, 'تێبینی دەبێت کەمتر لە ٥٠٠ پیت بێت')
    .optional()
    .nullable(),
});

export type ValidatedSalaryPayment = z.infer<typeof SalaryPaymentSchema>;

// ============ EXPENSE VALIDATION ============
export const ExpenseSchema = z.object({
  type: z.enum(['electricity', 'water', 'other'], {
    errorMap: () => ({ message: 'جۆری خەرجی پێویستە' }),
  }),
  amount: z.number()
    .positive('بڕی خەرجی دەبێت گەورەتر لە ٠ بێت')
    .max(100000000, 'بڕی خەرجی زۆر گەورەیە'),
  date: z.string().min(1, 'بەروار پێویستە'),
  note: z.string()
    .max(500, 'تێبینی دەبێت کەمتر لە ٥٠٠ پیت بێت')
    .optional()
    .nullable(),
});

export type ValidatedExpense = z.infer<typeof ExpenseSchema>;

// ============ VALIDATION HELPER ============
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map(e => e.message);
  return { success: false, errors };
}
