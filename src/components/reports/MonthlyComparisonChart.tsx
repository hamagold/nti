import { formatCurrency, MONTHS } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MonthlyData {
  month: number;
  monthName: string;
  income: number;
  expenses: number;
  salaries: number;
  profit: number;
}

interface MonthlyComparisonChartProps {
  data: MonthlyData[];
  year: number;
}

export function MonthlyComparisonChart({ data, year }: MonthlyComparisonChartProps) {
  const { t } = useTranslation();

  const totalIncome = data.reduce((s, d) => s + d.income, 0);
  const totalExpenses = data.reduce((s, d) => s + d.expenses + d.salaries, 0);
  const totalProfit = totalIncome - totalExpenses;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="rounded-xl bg-card border border-border p-4 shadow-xl text-sm space-y-2">
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
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-success/10 border border-success/20 p-4 text-center">
          <p className="text-xs text-success font-medium mb-1">{t('reports.income')}</p>
          <p className="text-lg font-bold text-success">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-center">
          <p className="text-xs text-destructive font-medium mb-1">{t('reports.expense')}</p>
          <p className="text-lg font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className={`rounded-xl p-4 text-center border ${totalProfit >= 0 ? 'bg-primary/10 border-primary/20' : 'bg-destructive/10 border-destructive/20'}`}>
          <div className="flex items-center justify-center gap-1 mb-1">
            {totalProfit >= 0 ? <TrendingUp className="h-3 w-3 text-primary" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
            <p className={`text-xs font-medium ${totalProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>{t('reports.profit')}</p>
          </div>
          <p className={`text-lg font-bold ${totalProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>{formatCurrency(totalProfit)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="monthName" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="income" name={t('reports.income')} fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name={t('reports.expense')} fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="salaries" name={t('common.salary')} fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="p-3 text-right font-semibold text-foreground">مانگ</th>
              <th className="p-3 text-right font-semibold text-success">{t('reports.income')}</th>
              <th className="p-3 text-right font-semibold text-destructive">{t('reports.expense')}</th>
              <th className="p-3 text-right font-semibold text-warning">{t('common.salary')}</th>
              <th className="p-3 text-right font-semibold text-primary">{t('reports.profit')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.month} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="p-3 font-medium text-foreground">{row.monthName}</td>
                <td className="p-3 text-success font-medium">{formatCurrency(row.income)}</td>
                <td className="p-3 text-destructive font-medium">{formatCurrency(row.expenses)}</td>
                <td className="p-3 text-warning font-medium">{formatCurrency(row.salaries)}</td>
                <td className={`p-3 font-bold ${row.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {formatCurrency(row.profit)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted/80 font-bold">
              <td className="p-3 text-foreground">{t('common.total')}</td>
              <td className="p-3 text-success">{formatCurrency(totalIncome)}</td>
              <td className="p-3 text-destructive">{formatCurrency(data.reduce((s, d) => s + d.expenses, 0))}</td>
              <td className="p-3 text-warning">{formatCurrency(data.reduce((s, d) => s + d.salaries, 0))}</td>
              <td className={`p-3 ${totalProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>{formatCurrency(totalProfit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
