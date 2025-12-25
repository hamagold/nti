import { cn } from '@/lib/utils';
import { DepartmentInfo, formatCurrency } from '@/types';
import { Users } from 'lucide-react';

interface DepartmentCardProps {
  department: DepartmentInfo;
  studentCount: number;
  totalIncome: number;
  delay?: number;
}

export function DepartmentCard({
  department,
  studentCount,
  totalIncome,
  delay = 0,
}: DepartmentCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-4xl">{department.icon}</span>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">{studentCount} قوتابی</span>
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-foreground mb-1">
          {department.name}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4">
          کرێی سالانە: {formatCurrency(department.yearlyFee)}
        </p>
        
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-1">داهاتی گشتی</p>
          <p className="text-xl font-bold text-primary">
            {formatCurrency(totalIncome)}
          </p>
        </div>
      </div>
    </div>
  );
}
