import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Expense as ExpenseType, formatCurrency, MONTHS } from '@/types';
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
import { Plus, Zap, Droplets, MoreHorizontal, Trash2, Building2, Loader2, Filter, Calendar, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Expenses() {
  const { expenses, addExpense, deleteExpense, expensesLoading } = useStore();
  const { t } = useTranslation();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();
  
  // Filters
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const years = Array.from({ length: 12 }, (_, i) => 2024 + i);

  const [formData, setFormData] = useState({
    type: '' as 'electricity' | 'water' | 'other',
    amount: '',
    note: '',
  });

  const expenseTypes = [
    { id: 'electricity', name: t('expenses.electricity'), icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
    { id: 'water', name: t('expenses.water'), icon: Droplets, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { id: 'other', name: t('expenses.other'), icon: MoreHorizontal, color: 'text-muted-foreground', bgColor: 'bg-muted' },
  ];

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      if (selectedYear !== 'all' && d.getFullYear() !== selectedYear) return false;
      if (selectedMonth !== 'all' && (d.getMonth() + 1) !== selectedMonth) return false;
      if (selectedType !== 'all' && e.type !== selectedType) return false;
      return true;
    });
  }, [expenses, selectedYear, selectedMonth, selectedType]);

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const electricityTotal = filteredExpenses.filter(e => e.type === 'electricity').reduce((sum, e) => sum + e.amount, 0);
  const waterTotal = filteredExpenses.filter(e => e.type === 'water').reduce((sum, e) => sum + e.amount, 0);
  const otherTotal = filteredExpenses.filter(e => e.type === 'other').reduce((sum, e) => sum + e.amount, 0);

  // Monthly chart data
  const monthlyChartData = useMemo(() => {
    if (selectedYear === 'all') return [];
    return MONTHS.map(month => {
      const monthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === selectedYear && (d.getMonth() + 1) === month.id;
      });
      return {
        name: month.name,
        electricity: monthExpenses.filter(e => e.type === 'electricity').reduce((s, e) => s + e.amount, 0),
        water: monthExpenses.filter(e => e.type === 'water').reduce((s, e) => s + e.amount, 0),
        other: monthExpenses.filter(e => e.type === 'other').reduce((s, e) => s + e.amount, 0),
      };
    });
  }, [expenses, selectedYear]);

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="rounded-xl bg-card border border-border p-3 shadow-xl text-sm space-y-1">
        <p className="font-bold text-foreground">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-muted-foreground">{p.name}:</span>
            <span className="font-semibold">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-8">
      <Header title={t('expenses.title')} subtitle={t('expenses.subtitle')} />

      <div className="p-4 md:p-8 space-y-6">
        {/* Filters */}
        <div className="rounded-2xl bg-card p-5 shadow-lg animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">{t('common.filter')}</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="space-y-2">
              <Label>{t('common.year')}</Label>
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(v === 'all' ? 'all' : parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>مانگ</Label>
              <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(v === 'all' ? 'all' : parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {MONTHS.map(month => (
                    <SelectItem key={month.id} value={month.id.toString()}>{month.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('expenses.expenseType')}</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {expenseTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 animate-slide-up">
          <div className="rounded-2xl bg-card p-5 shadow-lg border-r-4 border-r-yellow-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
              <span className="text-sm text-muted-foreground">{t('expenses.electricity')}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCurrency(electricityTotal)}</p>
          </div>

          <div className="rounded-2xl bg-card p-5 shadow-lg border-r-4 border-r-blue-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Droplets className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-sm text-muted-foreground">{t('expenses.water')}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCurrency(waterTotal)}</p>
          </div>

          <div className="rounded-2xl bg-card p-5 shadow-lg border-r-4 border-r-muted-foreground">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">{t('expenses.other')}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCurrency(otherTotal)}</p>
          </div>

          <div className="rounded-2xl bg-card p-5 shadow-lg border-r-4 border-r-destructive">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <span className="text-sm text-muted-foreground">{t('expenses.totalExpenses')}</span>
            </div>
            <p className="text-xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>

        {/* Monthly Chart */}
        {selectedYear !== 'all' && monthlyChartData.length > 0 && (
          <div className="rounded-2xl bg-card p-6 shadow-lg animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">خەرجیەکان بە مانگ - {selectedYear}</h3>
                <p className="text-sm text-muted-foreground">شیکردنەوەی مانگانەی خەرجیەکان</p>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="electricity" name={t('expenses.electricity')} fill="hsl(48, 96%, 53%)" radius={[2, 2, 0, 0]} stackId="a" />
                  <Bar dataKey="water" name={t('expenses.water')} fill="hsl(217, 91%, 60%)" radius={[2, 2, 0, 0]} stackId="a" />
                  <Bar dataKey="other" name={t('expenses.other')} fill="hsl(0, 0%, 60%)" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Add Button */}
        <div className="flex justify-end">
          <Button onClick={() => setFormOpen(true)} className="gradient-primary text-primary-foreground">
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
        ) : filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Building2 className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">{t('expenses.noExpenses')}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredExpenses
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((expense, index) => {
                const expenseType = expenseTypes.find((t) => t.id === expense.type);
                const Icon = expenseType?.icon || MoreHorizontal;
                return (
                  <div key={expense.id} className="rounded-2xl bg-card p-5 shadow-lg hover:shadow-xl transition-all animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl ${expenseType?.bgColor} flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${expenseType?.color}`} />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{expenseType?.name}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(expense.date), 'yyyy/MM/dd')}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(expense.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-2xl font-bold text-destructive mb-2">{formatCurrency(expense.amount)}</p>
                    {expense.note && <p className="text-sm text-muted-foreground truncate">{expense.note}</p>}
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
              <Select value={formData.type} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value as 'electricity' | 'water' | 'other' }))}>
                <SelectTrigger className="bg-muted/50"><SelectValue placeholder={t('expenses.selectType')} /></SelectTrigger>
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
              <Input id="amount" type="number" value={formData.amount} onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))} placeholder={t('expenses.expenseAmount')} className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">{t('expenses.noteOptional')}</Label>
              <Textarea id="note" value={formData.note} onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))} placeholder={t('common.note')} className="bg-muted/50 resize-none" rows={2} />
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" className="gradient-primary text-primary-foreground">{t('common.add')}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('expenses.confirmDeleteExpense')}</AlertDialogTitle>
            <AlertDialogDescription>{t('expenses.actionIrreversible')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
