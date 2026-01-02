import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  FileText,
  Settings,
  Building2,
  Receipt,
} from 'lucide-react';
import { SheetClose } from '@/components/ui/sheet';

const menuItems = [
  { icon: LayoutDashboard, label: 'داشبۆرد', path: '/' },
  { icon: GraduationCap, label: 'قوتابیان', path: '/students' },
  { icon: CreditCard, label: 'پارەدان', path: '/payments' },
  { icon: Receipt, label: 'پسولەکان', path: '/invoices' },
  { icon: Users, label: 'ستاف', path: '/staff' },
  { icon: Building2, label: 'خەرجیەکان', path: '/expenses' },
  { icon: FileText, label: 'ڕاپۆرتەکان', path: '/reports' },
  { icon: Settings, label: 'ڕێکخستنەکان', path: '/settings' },
];

export function MobileSidebar() {
  const location = useLocation();

  return (
    <div className="h-full bg-sidebar flex flex-col">
      {/* Logo Section */}
      <div className="flex h-20 items-center justify-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-foreground">
              پەیمانگای تەکنیکی
            </span>
            <span className="text-xs text-sidebar-foreground/70">نیشتمانی</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 space-y-2 px-3 flex-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <SheetClose asChild key={item.path}>
              <NavLink
                to={item.path}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-4 py-3 text-sidebar-foreground/70 transition-all duration-200',
                  'hover:bg-sidebar-accent hover:text-sidebar-foreground',
                  isActive && 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-transform duration-200',
                    'group-hover:scale-110',
                    isActive && 'text-sidebar-primary-foreground'
                  )}
                />
                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </NavLink>
            </SheetClose>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="rounded-xl bg-sidebar-accent/50 p-4">
          <p className="text-xs text-sidebar-foreground/60 text-center">
            دروست کراوە لە لایەن
          </p>
          <p className="mt-1 text-sm font-semibold text-sidebar-foreground text-center">
            محمد سلێمان احمد
          </p>
        </div>
      </div>
    </div>
  );
}
