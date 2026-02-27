import { formatCurrency } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface YearlyData {
  year: number;
  income: number;
  expenses: number;
  salaries: number;
  profit: number;
}

interface YearlyComparisonChartProps {
  data: YearlyData[];
}

export function YearlyComparisonChart({ data }: YearlyComparisonChartProps) {
  const { t } = useTranslation();

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
      {/* Year Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((yearData, i) => {
          const prevYear = i > 0 ? data[i - 1] : null;
          const profitChange = prevYear ? yearData.profit - prevYear.profit : 0;
          const isUp = profitChange >= 0;

          return (
            <div key={yearData.year} className="rounded-xl bg-muted/30 border border-border p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-foreground">{yearData.year}</h4>
                {prevYear && (
                  <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isUp ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {formatCurrency(Math.abs(profitChange))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">{t('reports.income')}</p>
                  <p className="font-semibold text-success">{formatCurrency(yearData.income)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{t('reports.expense')}</p>
                  <p className="font-semibold text-destructive">{formatCurrency(yearData.expenses + yearData.salaries)}</p>
                </div>
              </div>
              <div className={`pt-2 border-t border-border`}>
                <div className="flex items-center gap-2">
                  {yearData.profit >= 0 ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                  <span className={`font-bold ${yearData.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {formatCurrency(yearData.profit)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Line Chart for trend */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="income" name={t('reports.income')} stroke="hsl(142, 71%, 45%)" strokeWidth={3} dot={{ r: 5 }} />
            <Line type="monotone" dataKey="profit" name={t('reports.profit')} stroke="hsl(217, 91%, 60%)" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="income" name={t('reports.income')} fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name={t('reports.expense')} fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="salaries" name={t('common.salary')} fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
