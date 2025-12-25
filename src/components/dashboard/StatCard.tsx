import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'primary' | 'secondary' | 'accent' | 'success';
  delay?: number;
}

const variantStyles = {
  primary: 'gradient-primary shadow-glow',
  secondary: 'gradient-secondary',
  accent: 'gradient-accent',
  success: 'bg-success',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'primary',
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background decoration */}
      <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                trend.isPositive
                  ? 'bg-success/10 text-success'
                  : 'bg-destructive/10 text-destructive'
              )}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110',
            variantStyles[variant]
          )}
        >
          <Icon className="h-7 w-7 text-primary-foreground" />
        </div>
      </div>
    </div>
  );
}
