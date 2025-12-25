import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Menu, X, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ntiLogo from '@/assets/nti-logo.jpg';

export const WebsiteHeader = () => {
  const { language, setLanguage, t, dir } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { key: 'nav.home', href: '#home' },
    { key: 'nav.departments', href: '#departments' },
    { key: 'nav.activities', href: '#activities' },
    { key: 'nav.about', href: '#about' },
    { key: 'nav.contact', href: '#contact' },
  ];

  const languages = [
    { code: 'ku' as const, name: 'کوردی', flag: '🇮🇶' },
    { code: 'ar' as const, name: 'العربية', flag: '🇸🇦' },
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50" dir={dir}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={ntiLogo} alt="NTI Logo" className="w-14 h-14 rounded-xl object-cover shadow-lg" />
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-foreground">{t('hero.title')}</h1>
              <p className="text-xs text-muted-foreground">{t('hero.subtitle')}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="text-foreground/80 hover:text-primary transition-colors font-medium"
              >
                {t(item.key)}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {languages.find((l) => l.code === language)?.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={language === lang.code ? 'bg-primary/10' : ''}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className="text-foreground/80 hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(item.key)}
                </a>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
