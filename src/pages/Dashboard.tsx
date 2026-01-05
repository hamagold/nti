import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { DepartmentCard } from '@/components/dashboard/DepartmentCard';
import { RecentPayments } from '@/components/dashboard/RecentPayments';
import { useStore } from '@/store/useStore';
import { DEPARTMENTS, formatCurrency } from '@/types';
import {
  GraduationCap,
  Wallet,
  TrendingUp,
  Users,
  Calendar,
  Loader2,
} from 'lucide-react';

export default function Dashboard() {
  const { students, staff, expenses, isLoading } = useStore();

  // Calculate statistics
  const totalStudents = students.length;
  const totalIncome = students.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalExpected = students.reduce((sum, s) => sum + s.totalFee, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSalaries = staff.reduce((sum, s) => sum + s.salary, 0);
  const netProfit = totalIncome - totalExpenses - totalSalaries;

  const currentYear = new Date().getFullYear();

  if (isLoading) {
    return (
      <div className="min-h-screen pb-8">
        <Header
          title="داشبۆرد"
          subtitle={`ساڵی ${currentYear} - پەیمانگای تەکنیکی نیشتمانی`}
        />
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">بارکردنی داتا...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <Header
        title="داشبۆرد"
        subtitle={`ساڵی ${currentYear} - پەیمانگای تەکنیکی نیشتمانی`}
      />

      <div className="p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="کۆی قوتابیان"
            value={totalStudents.toString()}
            subtitle="قوتابی تۆمارکراو"
            icon={GraduationCap}
            variant="primary"
            delay={0}
            link="/students"
          />
          <StatCard
            title="داهاتی وەرگیراو"
            value={formatCurrency(totalIncome)}
            subtitle={`لە ${formatCurrency(totalExpected)}`}
            icon={Wallet}
            variant="secondary"
            trend={{ value: 12, isPositive: true }}
            delay={100}
            link="/payments"
          />
          <StatCard
            title="قازانجی خاوێن"
            value={formatCurrency(netProfit)}
            subtitle="دوای خەرجیەکان"
            icon={TrendingUp}
            variant="accent"
            trend={{ value: netProfit > 0 ? 8 : -5, isPositive: netProfit > 0 }}
            delay={200}
            link="/reports"
          />
          <StatCard
            title="ستاف"
            value={staff.length.toString()}
            subtitle="مامۆستا و کارمەند"
            icon={Users}
            variant="success"
            delay={300}
            link="/staff"
          />
        </div>

        {/* Departments Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">بەشەکان</h2>
              <p className="text-sm text-muted-foreground">
                ئاماری بەشەکان و داهات
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {DEPARTMENTS.map((dept, index) => {
              const deptStudents = students.filter(
                (s) => s.department === dept.id
              );
              const deptIncome = deptStudents.reduce(
                (sum, s) => sum + s.paidAmount,
                0
              );
              return (
                <DepartmentCard
                  key={dept.id}
                  department={dept}
                  studentCount={deptStudents.length}
                  totalIncome={deptIncome}
                  delay={index * 100}
                />
              );
            })}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentPayments />
          
          {/* Quick Stats */}
          <div className="rounded-2xl bg-card p-6 shadow-lg animate-slide-up">
            <h3 className="text-lg font-bold text-foreground mb-6">
              ئاماری گشتی
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <span className="text-muted-foreground">کۆی خەرجیەکان</span>
                <span className="font-bold text-destructive">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <span className="text-muted-foreground">کۆی مووچەکان</span>
                <span className="font-bold text-foreground">
                  {formatCurrency(totalSalaries)}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <span className="text-muted-foreground">قەرزی قوتابیان</span>
                <span className="font-bold text-warning">
                  {formatCurrency(totalExpected - totalIncome)}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-success/10 border border-success/20">
                <span className="font-semibold text-success">قازانجی تەواو</span>
                <span className="font-bold text-success text-lg">
                  {formatCurrency(netProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
