import { Bell, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-8">
      <div className="animate-slide-in-right">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="گەڕان..."
            className="w-64 pr-10 bg-muted/50 border-0 focus-visible:ring-primary/50"
          />
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-primary/10"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
            3
          </span>
        </Button>

        {/* Profile */}
        <Button
          variant="ghost"
          className="flex items-center gap-3 hover:bg-primary/10"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold">ئەدمین</p>
            <p className="text-xs text-muted-foreground">بەڕێوەبەر</p>
          </div>
        </Button>
      </div>
    </header>
  );
}
