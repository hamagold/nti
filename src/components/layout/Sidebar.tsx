import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  FileText,
  Settings,
  ChevronRight,
  Building2,
  Receipt,
  UserPlus,
} from 'lucide-react';

const allMenuItems = [
  { icon: LayoutDashboard, label: 'داشبۆرد', path: '/', permission: 'view_dashboard' as const },
  { icon: GraduationCap, label: 'قوتابیان', path: '/students', permission: 'view_students' as const },
  { icon: CreditCard, label: 'پارەدان', path: '/payments', permission: 'view_payments' as const },
  { icon: Receipt, label: 'پسولەکان', path: '/invoices', permission: 'view_invoices' as const },
  { icon: Users, label: 'ستاف', path: '/staff', permission: 'view_staff' as const },
  { icon: Building2, label: 'خەرجیەکان', path: '/expenses', permission: 'view_expenses' as const },
  { icon: FileText, label: 'ڕاپۆرتەکان', path: '/reports', permission: 'view_reports' as const },
  { icon: Settings, label: 'ڕێکخستنەکان', path: '/settings', permission: 'view_settings' as const },
];

// Editor menu - only add student/staff
const editorMenuItems = [
  { icon: UserPlus, label: 'تۆمارکردنی قوتابی', path: '/students/add', permission: 'add_student' as const },
  { icon: Users, label: 'تۆمارکردنی ستاف', path: '/staff/add', permission: 'add_staff' as const },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { hasPermission } = usePermissions();

  // Menu visibility is controlled ONLY by permissions (including for local_staff)
  const menuItems = [...allMenuItems, ...editorMenuItems].filter(item => hasPermission(item.permission));

  return (
    <aside
      className={cn(
        'fixed right-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo Section */}
      <div className="flex h-20 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-3 animate-fade-in">
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
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-foreground transition-all hover:bg-sidebar-primary hover:text-sidebar-primary-foreground',
            collapsed && 'mx-auto'
          )}
        >
          <ChevronRight
            className={cn(
              'h-4 w-4 transition-transform duration-300',
              !collapsed && 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 space-y-2 px-3">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-4 py-3 text-sidebar-foreground/70 transition-all duration-200',
                'hover:bg-sidebar-accent hover:text-sidebar-foreground',
                isActive && 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow',
                collapsed && 'justify-center px-2'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform duration-200',
                  'group-hover:scale-110',
                  isActive && 'text-sidebar-primary-foreground'
                )}
              />
              {!collapsed && (
                <span className="text-sm font-medium animate-fade-in">
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="absolute bottom-6 right-0 left-0 px-4">
          <div className="rounded-xl bg-sidebar-accent/50 p-4 animate-fade-in">
            <p className="text-xs text-sidebar-foreground/60 text-center">
              دروست کراوە لە لایەن
            </p>
            <p className="mt-1 text-sm font-semibold text-sidebar-foreground text-center">
              محمد سلێمان احمد
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
