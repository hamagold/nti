import { Search, User, LogOut, Menu, Sun, Moon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MobileSidebar } from './MobileSidebar';
import { useTheme } from '@/hooks/useTheme';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { logout, currentUser, currentRole } = useAuthStore();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleName = () => {
    switch (currentRole) {
      case 'superadmin': return t('header.superadmin');
      case 'admin': return t('header.admin');
      case 'staff': return t('header.staff');
      case 'local_staff': return t('header.local_staff');
      default: return t('header.user');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 md:h-20 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-4 md:px-8">
      <div className="flex items-center gap-3">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-64">
            <MobileSidebar />
          </SheetContent>
        </Sheet>

        <div className="animate-slide-in-right">
          <h1 className="text-lg md:text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Search - Hidden on mobile */}
        <div className="relative hidden lg:block">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('header.search')}
            className="w-48 xl:w-64 pr-10 bg-muted/50 border-0 focus-visible:ring-primary/50"
          />
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-foreground hover:bg-muted"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications */}
        <NotificationDropdown />

        {/* Profile */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold" dir="ltr">{currentUser || 'ئەدمین'}</p>
            <p className="text-xs text-muted-foreground">{getRoleName()}</p>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
