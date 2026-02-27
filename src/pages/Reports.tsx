import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';
import { formatCurrency, DEPARTMENTS, Department, MONTHS } from '@/types';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  GraduationCap,
  Building2,
  PieChart,
  BarChart3,
  Filter,
  Calendar,
  CalendarDays,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonthlyComparisonChart } from '@/components/reports/MonthlyComparisonChart';
import { YearlyComparisonChart } from '@/components/reports/YearlyComparisonChart';

export default function Reports() {
  const { students, staff, expenses } = useStore();
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'all'>('all');
  
  const years = Array.from({ length: 12 }, (_, i) => 2024 + i);

  // Filter students
  const filteredStudents = useMemo(() => students.filter(s => {
    if (selectedDepartment !== 'all' && s.department !== selectedDepartment) return false;
    return true;
  }), [students, selectedDepartment]);

  // Monthly data calculation
  const monthlyData = useMemo(() => {
    return MONTHS.map(month => {
      // Income: payments made in this month/year
      const monthIncome = filteredStudents.reduce((sum, s) => {
        return sum + s.payments
          .filter(p => {
            const d = new Date(p.date);
            return d.getFullYear() === selectedYear && (d.getMonth() + 1) === month.id;
          })
          .reduce((pSum, p) => pSum + p.amount, 0);
      }, 0);

      // Expenses in this month
      const monthExpenses = expenses
        .filter(e => {
          const d = new Date(e.date);
          return d.getFullYear() === selectedYear && (d.getMonth() + 1) === month.id;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      // Salaries paid in this month
      const monthSalaries = staff.reduce((sum, s) => {
        return sum + (s.salaryPayments || [])
          .filter(p => p.year === selectedYear && p.month === month.id)
          .reduce((pSum, p) => pSum + p.amount, 0);
      }, 0);

      return {
        month: month.id,
        monthName: month.name,
        income: monthIncome,
        expenses: monthExpenses,
        salaries: monthSalaries,
        profit: monthIncome - monthExpenses - monthSalaries,
      };
    });
  }, [filteredStudents, expenses, staff, selectedYear]);

  // Yearly comparison data
  const yearlyData = useMemo(() => {
    return years.filter(y => y <= currentYear + 1).map(year => {
      const yearIncome = filteredStudents.reduce((sum, s) => {
        return sum + s.payments
          .filter(p => new Date(p.date).getFullYear() === year)
          .reduce((pSum, p) => pSum + p.amount, 0);
      }, 0);

      const yearExpenses = expenses
        .filter(e => new Date(e.date).getFullYear() === year)
        .reduce((sum, e) => sum + e.amount, 0);

      const yearSalaries = staff.reduce((sum, s) => {
        return sum + (s.salaryPayments || [])
          .filter(p => p.year === year)
          .reduce((pSum, p) => pSum + p.amount, 0);
      }, 0);

      return {
        year,
        income: yearIncome,
        expenses: yearExpenses,
        salaries: yearSalaries,
        profit: yearIncome - yearExpenses - yearSalaries,
      };
    }).filter(y => y.income > 0 || y.expenses > 0 || y.salaries > 0);
  }, [filteredStudents, expenses, staff, years, currentYear]);

  // Filtered totals based on month selection
  const totals = useMemo(() => {
    if (selectedMonth === 'all') {
      const income = monthlyData.reduce((s, d) => s + d.income, 0);
      const exp = monthlyData.reduce((s, d) => s + d.expenses, 0);
      const sal = monthlyData.reduce((s, d) => s + d.salaries, 0);
      return { income, expenses: exp, salaries: sal, profit: income - exp - sal };
    }
    const m = monthlyData.find(d => d.month === selectedMonth);
    if (!m) return { income: 0, expenses: 0, salaries: 0, profit: 0 };
    return { income: m.income, expenses: m.expenses, salaries: m.salaries, profit: m.profit };
  }, [monthlyData, selectedMonth]);

  const totalStudents = filteredStudents.length;
  const totalExpected = filteredStudents.reduce((sum, s) => sum + s.totalFee, 0);
  const totalDebt = totalExpected - filteredStudents.reduce((sum, s) => sum + s.paidAmount, 0);
  const profitPercentage = totals.income > 0 ? ((totals.profit / totals.income) * 100).toFixed(1) : '0';

  // Department statistics
  const departmentStats = DEPARTMENTS.map((dept) => {
    const deptStudents = filteredStudents.filter((s) => s.department === dept.id);
    const deptIncome = deptStudents.reduce((sum, s) => sum + s.paidAmount, 0);
    const deptExpected = deptStudents.reduce((sum, s) => sum + s.totalFee, 0);
    return {
      ...dept,
      students: deptStudents.length,
      income: deptIncome,
      expected: deptExpected,
      debt: deptExpected - deptIncome,
      percentage: deptExpected > 0 ? ((deptIncome / deptExpected) * 100).toFixed(0) : '0',
    };
  });

  return (
    <div className="min-h-screen pb-8">
      <Header title={t('reports.title')} subtitle={t('reports.subtitle')} />

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
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
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
              <Label>{t('common.department')}</Label>
              <Select value={selectedDepartment} onValueChange={(v) => setSelectedDepartment(v as Department | 'all')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {DEPARTMENTS.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.icon} {dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-slide-up">
          <div className="rounded-2xl bg-card p-5 shadow-lg border-r-4 border-r-success">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-5 w-5 text-success" />
              <span className="text-sm text-success font-medium">{t('reports.income')}</span>
            </div>
            <p className="text-2xl font-bold text-success">{formatCurrency(totals.income)}</p>
          </div>

          <div className="rounded-2xl bg-card p-5 shadow-lg border-r-4 border-r-warning">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="h-5 w-5 text-warning" />
              <span className="text-sm text-warning font-medium">{t('dashboard.pendingPayments')}</span>
            </div>
            <p className="text-2xl font-bold text-warning">{formatCurrency(totalDebt)}</p>
          </div>

          <div className="rounded-2xl bg-card p-5 shadow-lg border-r-4 border-r-destructive">
            <div className="flex items-center gap-3 mb-3">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <span className="text-sm text-destructive font-medium">{t('dashboard.totalExpenses')}</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(totals.expenses + totals.salaries)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('reports.expense')}: {formatCurrency(totals.expenses)} | {t('common.salary')}: {formatCurrency(totals.salaries)}
            </p>
          </div>

          <div className={`rounded-2xl bg-card p-5 shadow-lg border-r-4 ${totals.profit >= 0 ? 'border-r-primary' : 'border-r-destructive'}`}>
            <div className="flex items-center gap-3 mb-3">
              {totals.profit >= 0 ? <TrendingUp className="h-5 w-5 text-primary" /> : <TrendingDown className="h-5 w-5 text-destructive" />}
              <span className={`text-sm font-medium ${totals.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {t('reports.profit')}
              </span>
            </div>
            <p className={`text-2xl font-bold ${totals.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(totals.profit)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">%{profitPercentage}</p>
          </div>
        </div>

        {/* Tabs for Monthly & Yearly */}
        <Tabs defaultValue="monthly" className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <TabsList className="w-full grid grid-cols-3 mb-4 h-12">
            <TabsTrigger value="monthly" className="gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              بەراوردی مانگانە
            </TabsTrigger>
            <TabsTrigger value="yearly" className="gap-2 text-sm">
              <CalendarDays className="h-4 w-4" />
              بەراوردی ساڵانە
            </TabsTrigger>
            <TabsTrigger value="departments" className="gap-2 text-sm">
              <PieChart className="h-4 w-4" />
              {t('settings.departments')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monthly">
            <div className="rounded-2xl bg-card p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">بەراوردی مانگانە - {selectedYear}</h2>
                  <p className="text-sm text-muted-foreground">داهات و خەرجی هەر مانگ</p>
                </div>
              </div>
              <MonthlyComparisonChart data={monthlyData} year={selectedYear} />
            </div>
          </TabsContent>

          <TabsContent value="yearly">
            <div className="rounded-2xl bg-card p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl gradient-secondary flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">بەراوردی ساڵانە</h2>
                  <p className="text-sm text-muted-foreground">ڕووی گشتی لە ساڵ بە ساڵ</p>
                </div>
              </div>
              {yearlyData.length > 0 ? (
                <YearlyComparisonChart data={yearlyData} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>هیچ داتایەک نەدۆزرایەوە بۆ بەراوردی ساڵانە</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="departments">
            <div className="rounded-2xl bg-card p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl gradient-secondary flex items-center justify-center">
                  <PieChart className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{t('settings.departments')}</h2>
                  <p className="text-sm text-muted-foreground">{t('reports.subtitle')}</p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {departmentStats.map((dept, index) => (
                  <div
                    key={dept.id}
                    className="p-5 rounded-xl bg-muted/30 border border-border hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{dept.icon}</span>
                        <div>
                          <p className="font-bold text-foreground">{dept.name}</p>
                          <p className="text-sm text-muted-foreground">{dept.students} قوتابی</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-bold text-primary">%{dept.percentage}</p>
                        <p className="text-xs text-muted-foreground">کۆکراوەتەوە</p>
                      </div>
                    </div>

                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden mb-4">
                      <div className="h-full rounded-full gradient-primary transition-all duration-1000" style={{ width: `${dept.percentage}%` }} />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">{t('common.total')}</p>
                        <p className="font-semibold">{formatCurrency(dept.expected)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t('common.paid')}</p>
                        <p className="font-semibold text-success">{formatCurrency(dept.income)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t('common.remaining')}</p>
                        <p className="font-semibold text-warning">{formatCurrency(dept.debt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="rounded-2xl bg-card p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold">{t('students.title')}</span>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{totalStudents}</p>
            <p className="text-sm text-muted-foreground">{t('common.total')}: {formatCurrency(totalExpected)}</p>
          </div>

          <div className="rounded-2xl bg-card p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-secondary" />
              </div>
              <span className="font-semibold">{t('nav.staff')}</span>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{staff.length}</p>
            <p className="text-sm text-muted-foreground">{t('common.salary')}: {formatCurrency(staff.reduce((s, st) => s + st.salary, 0))}</p>
          </div>

          <div className="rounded-2xl bg-card p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-destructive" />
              </div>
              <span className="font-semibold">{t('expenses.title')}</span>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{expenses.length}</p>
            <p className="text-sm text-muted-foreground">{t('common.total')}: {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
