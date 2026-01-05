import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Staff, SalaryPayment, Department } from '@/types';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

type DbStaff = Tables<'staff'>;
type DbSalaryPayment = Tables<'salary_payments'>;

// Convert database staff to app staff
const mapDbToStaff = (
  dbStaff: DbStaff,
  salaryPayments: DbSalaryPayment[]
): Staff => ({
  id: dbStaff.id,
  name: dbStaff.name,
  phone: dbStaff.phone,
  role: dbStaff.role as 'teacher' | 'employee',
  department: dbStaff.department as Department | undefined,
  salary: Number(dbStaff.salary),
  joinDate: dbStaff.join_date,
  salaryPayments: salaryPayments.map(sp => ({
    id: sp.id,
    staffId: sp.staff_id,
    month: sp.month,
    year: sp.year,
    amount: Number(sp.amount),
    date: sp.date,
    note: sp.note || undefined,
  })),
});

export function useStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data: staff, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const staffIds = staff.map(s => s.id);
      
      const { data: salaryPayments, error: spError } = await supabase
        .from('salary_payments')
        .select('*')
        .in('staff_id', staffIds);

      if (spError) throw spError;

      return staff.map(s => mapDbToStaff(
        s,
        salaryPayments.filter(sp => sp.staff_id === s.id)
      ));
    },
  });
}

export function useAddStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staff: Omit<Staff, 'id' | 'salaryPayments'>) => {
      const { data, error } = await supabase
        .from('staff')
        .insert({
          name: staff.name,
          phone: staff.phone,
          role: staff.role,
          department: staff.department || null,
          salary: staff.salary,
          join_date: staff.joinDate,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('ستاف بە سەرکەوتوویی زیاد کرا');
    },
    onError: (error) => {
      console.error('Error adding staff:', error);
      toast.error('هەڵە لە زیادکردنی ستاف');
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Staff> }) => {
      const dbUpdates: Record<string, unknown> = {};
      
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.role !== undefined) dbUpdates.role = updates.role;
      if (updates.department !== undefined) dbUpdates.department = updates.department || null;
      if (updates.salary !== undefined) dbUpdates.salary = updates.salary;

      const { error } = await supabase
        .from('staff')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('زانیاری ستاف نوێکرایەوە');
    },
    onError: (error) => {
      console.error('Error updating staff:', error);
      toast.error('هەڵە لە نوێکردنەوەی ستاف');
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('ستاف سڕایەوە');
    },
    onError: (error) => {
      console.error('Error deleting staff:', error);
      toast.error('هەڵە لە سڕینەوەی ستاف');
    },
  });
}

export function useAddSalaryPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ staffId, payment }: { staffId: string; payment: Omit<SalaryPayment, 'id' | 'staffId'> }) => {
      const { error } = await supabase
        .from('salary_payments')
        .insert({
          staff_id: staffId,
          month: payment.month,
          year: payment.year,
          amount: payment.amount,
          date: payment.date,
          note: payment.note || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('مووچە تۆمار کرا');
    },
    onError: (error) => {
      console.error('Error adding salary payment:', error);
      toast.error('هەڵە لە تۆمارکردنی مووچە');
    },
  });
}
