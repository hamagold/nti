import { useLanguage } from '@/contexts/LanguageContext';
import ntiLogo from '@/assets/nti-logo.jpg';
import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

export const Footer = () => {
  const { t, dir } = useLanguage();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'Youtube' },
    { icon: Twitter, href: '#', label: 'Twitter' },
  ];

  return (
    <footer className="bg-card border-t border-border" dir={dir}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Logo & Info */}
          <div className="flex items-center gap-4">
            <img src={ntiLogo} alt="NTI Logo" className="w-16 h-16 rounded-xl object-cover shadow-lg" />
            <div>
              <h3 className="font-bold text-lg text-foreground">{t('hero.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('hero.subtitle')}</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  className="p-3 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  aria-label={social.label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>

          {/* Copyright */}
          <div className="text-center md:text-end">
            <p className="text-muted-foreground text-sm">
              © {currentYear} {t('footer.rights')}
            </p>
            <p className="text-primary text-xs mt-1">{t('footer.developer')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
