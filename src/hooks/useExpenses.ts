import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Expense } from '@/types';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

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
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          type: expense.type,
          amount: expense.amount,
          date: expense.date,
          note: expense.note || null,
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
