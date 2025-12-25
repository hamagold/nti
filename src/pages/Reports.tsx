import { Header } from '@/components/layout/Header';
import { useStore } from '@/store/useStore';
import { formatCurrency, DEPARTMENTS } from '@/types';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  GraduationCap,
  Building2,
  PieChart,
  BarChart3,
} from 'lucide-react';

export default function Reports() {
  const { students, staff, expenses } = useStore();

  // Calculate all statistics
  const totalStudents = students.length;
  const totalIncome = students.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalExpected = students.reduce((sum, s) => sum + s.totalFee, 0);
  const totalDebt = totalExpected - totalIncome;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSalaries = staff.reduce((sum, s) => sum + s.salary, 0);
  const netProfit = totalIncome - totalExpenses - totalSalaries;
  const profitPercentage = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

  // Department statistics
  const departmentStats = DEPARTMENTS.map((dept) => {
    const deptStudents = students.filter((s) => s.department === dept.id);
    const deptIncome = deptStudents.reduce((sum, s) => sum + s.paidAmount, 0);
    const deptExpected = deptStudents.reduce((sum, s) => sum + s.totalFee, 0);
    return {
      ...dept,
      students: deptStudents.length,
      income: deptIncome,
      expected: deptExpected,
      debt: deptExpected - deptIncome,
      percentage: deptExpected > 0 ? ((deptIncome / deptExpected) * 100).toFixed(0) : 0,
    };
  });

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen pb-8">
      <Header
        title="ڕاپۆرتەکان"
        subtitle={`ڕاپۆرتی ساڵی ${currentYear}`}
      />

      <div className="p-8 space-y-8">
        {/* Main Stats */}
        <div className="rounded-2xl bg-card p-8 shadow-lg animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">خولاسەی دارایی</h2>
              <p className="text-sm text-muted-foreground">ساڵی {currentYear}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 rounded-xl bg-success/10 border border-success/20">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-5 w-5 text-success" />
                <span className="text-sm text-success font-medium">داهاتی وەرگیراو</span>
              </div>
              <p className="text-3xl font-bold text-success">
                {formatCurrency(totalIncome)}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="h-5 w-5 text-warning" />
                <span className="text-sm text-warning font-medium">قەرزی قوتابیان</span>
              </div>
              <p className="text-3xl font-bold text-warning">
                {formatCurrency(totalDebt)}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-3 mb-3">
                <TrendingDown className="h-5 w-5 text-destructive" />
                <span className="text-sm text-destructive font-medium">کۆی خەرجیەکان</span>
              </div>
              <p className="text-3xl font-bold text-destructive">
                {formatCurrency(totalExpenses + totalSalaries)}
              </p>
            </div>

            <div className={`p-6 rounded-xl border ${netProfit >= 0 ? 'bg-primary/10 border-primary/20' : 'bg-destructive/10 border-destructive/20'}`}>
              <div className="flex items-center gap-3 mb-3">
                {netProfit >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-primary" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                )}
                <span className={`text-sm font-medium ${netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  قازانجی خاوێن
                </span>
              </div>
              <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {formatCurrency(netProfit)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                %{profitPercentage} لە داهات
              </p>
            </div>
          </div>
        </div>

        {/* Department Stats */}
        <div className="rounded-2xl bg-card p-8 shadow-lg animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl gradient-secondary flex items-center justify-center">
              <PieChart className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">ئاماری بەشەکان</h2>
              <p className="text-sm text-muted-foreground">بەراوردی بەشەکان</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {departmentStats.map((dept, index) => (
              <div
                key={dept.id}
                className="p-6 rounded-xl bg-muted/50 border border-border animate-slide-up"
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{dept.icon}</span>
                    <div>
                      <p className="font-bold text-foreground">{dept.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {dept.students} قوتابی
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-primary">
                      %{dept.percentage}
                    </p>
                    <p className="text-xs text-muted-foreground">کۆکراوەتەوە</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-3 w-full rounded-full bg-muted overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full gradient-primary transition-all duration-1000"
                    style={{ width: `${dept.percentage}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">کۆی چاوەڕوان</p>
                    <p className="font-semibold">{formatCurrency(dept.expected)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">وەرگیراو</p>
                    <p className="font-semibold text-success">{formatCurrency(dept.income)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ماوە</p>
                    <p className="font-semibold text-warning">{formatCurrency(dept.debt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-card p-6 shadow-lg animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold">قوتابیان</span>
            </div>
            <p className="text-4xl font-bold text-foreground mb-2">{totalStudents}</p>
            <p className="text-sm text-muted-foreground">
              کۆی داهاتی چاوەڕوان: {formatCurrency(totalExpected)}
            </p>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-lg animate-slide-up" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-secondary" />
              </div>
              <span className="font-semibold">ستاف</span>
            </div>
            <p className="text-4xl font-bold text-foreground mb-2">{staff.length}</p>
            <p className="text-sm text-muted-foreground">
              کۆی مووچەکان: {formatCurrency(totalSalaries)}
            </p>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-lg animate-slide-up" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-destructive" />
              </div>
              <span className="font-semibold">خەرجیەکان</span>
            </div>
            <p className="text-4xl font-bold text-foreground mb-2">
              {expenses.length}
            </p>
            <p className="text-sm text-muted-foreground">
              کۆی خەرجی: {formatCurrency(totalExpenses)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
