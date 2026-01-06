import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Expense } from '@/types';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';
import { ExpenseSchema, validateInput } from '@/lib/validations';

type DbExpense = Tables<'expenses'>;

// Convert database expense to app expense
const mapDbToExpense = (dbExpense: DbExpense): Expense => ({
  id: dbExpense.id,
  type: dbExpense.type as 'electricity' | 'water' | 'other',
  amount: Number(dbExpense.amount),
  date: dbExpense.date,
  note: dbExpense.note || undefined,
});

export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(mapDbToExpense);
    },
  });
}

export function useAddExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expense: Omit<Expense, 'id'>) => {
      // Validate input
      const validation = validateInput(ExpenseSchema, expense);
      if (!validation.success) {
        throw new Error((validation as { success: false; errors: string[] }).errors.join(', '));
      }
      const validData = (validation as { success: true; data: typeof expense }).data;

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          type: validData.type,
          amount: validData.amount,
          date: validData.date,
          note: validData.note?.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('خەرجی بە سەرکەوتوویی تۆمار کرا');
    },
    onError: (error) => {
      console.error('Error adding expense:', error);
      toast.error('هەڵە لە زیادکردنی خەرجی');
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('خەرجی سڕایەوە');
    },
    onError: (error) => {
      console.error('Error deleting expense:', error);
      toast.error('هەڵە لە سڕینەوەی خەرجی');
    },
  });
}
