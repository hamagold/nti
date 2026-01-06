import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Expense as ExpenseType, formatCurrency } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Plus, Zap, Droplets, MoreHorizontal, Trash2, Building2, Loader2 } from 'lucide-react';

export default function Expenses() {
  const { expenses, addExpense, deleteExpense, expensesLoading } = useStore();
  const { t } = useTranslation();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: '' as 'electricity' | 'water' | 'other',
    amount: '',
    note: '',
  });

  const expenseTypes = [
    { id: 'electricity', name: t('expenses.electricity'), icon: Zap, color: 'text-yellow-500' },
    { id: 'water', name: t('expenses.water'), icon: Droplets, color: 'text-blue-500' },
    { id: 'other', name: t('expenses.other'), icon: MoreHorizontal, color: 'text-gray-500' },
  ];

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const electricityTotal = expenses
    .filter((e) => e.type === 'electricity')
    .reduce((sum, e) => sum + e.amount, 0);
  const waterTotal = expenses
    .filter((e) => e.type === 'water')
    .reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type || !formData.amount) {
      toast.error(t('staffPage.fillAllFields'));
      return;
    }

    addExpense({
      id: crypto.randomUUID(),
      type: formData.type,
      amount: parseFloat(formData.amount),
      date: new Date().toISOString(),
      note: formData.note,
    });

    toast.success(t('expenses.expenseAdded'));
    setFormOpen(false);
    setFormData({ type: '' as 'electricity' | 'water' | 'other', amount: '', note: '' });
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteExpense(deleteId);
      toast.success(t('expenses.expenseDeleted'));
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen pb-8">
      <Header
        title={t('expenses.title')}
        subtitle={t('expenses.subtitle')}
      />

      <div className="p-8">
        {/* Stats */}
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <div className="rounded-2xl bg-card p-6 shadow-lg animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('expenses.electricity')}</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(electricityTotal)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-lg animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Droplets className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('expenses.water')}</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(waterTotal)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-lg animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('expenses.totalExpenses')}</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Button */}
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => setFormOpen(true)}
            className="gradient-primary text-primary-foreground"
          >
            <Plus className="h-5 w-5 ml-2" />
            {t('expenses.newExpense')}
          </Button>
        </div>

        {/* Expenses List */}
        {expensesLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">{t('expenses.loadingExpenses')}</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Building2 className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">{t('expenses.noExpenses')}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {expenses
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((expense, index) => {
                const expenseType = expenseTypes.find((t) => t.id === expense.type);
                const Icon = expenseType?.icon || MoreHorizontal;

                return (
                  <div
                    key={expense.id}
                    className="rounded-2xl bg-card p-6 shadow-lg animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl bg-muted flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${expenseType?.color}`} />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">
                            {expenseType?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(expense.date), 'yyyy/MM/dd')}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(expense.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-2xl font-bold text-destructive mb-2">
                      {formatCurrency(expense.amount)}
                    </p>

                    {expense.note && (
                      <p className="text-sm text-muted-foreground truncate">
                        {expense.note}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Expense Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('expenses.addNewExpense')}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>{t('expenses.expenseType')}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: value as 'electricity' | 'water' | 'other',
                  }))
                }
              >
                <SelectTrigger className="bg-muted/50">
                  <SelectValue placeholder={t('expenses.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  {expenseTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <span className="flex items-center gap-2">
                        <type.icon className={`h-4 w-4 ${type.color}`} />
                        <span>{type.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">{t('common.amount')} (دینار)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
                placeholder={t('expenses.expenseAmount')}
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">{t('expenses.noteOptional')}</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, note: e.target.value }))
                }
                placeholder={t('common.note')}
                className="bg-muted/50 resize-none"
                rows={2}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="gradient-primary text-primary-foreground">
                {t('common.add')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('expenses.confirmDeleteExpense')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('expenses.actionIrreversible')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
