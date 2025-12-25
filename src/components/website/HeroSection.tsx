import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import ntiLogo from '@/assets/nti-logo.jpg';

export const HeroSection = () => {
  const { t, dir, language } = useLanguage();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20" dir={dir}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl blur-2xl opacity-50 animate-pulse" />
            <img 
              src={ntiLogo} 
              alt="NTI Logo" 
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover shadow-2xl border-4 border-background"
            />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t('hero.subtitle')}</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            {t('hero.title')}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('hero.description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="gap-2 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-primary/25 transition-all">
              {t('hero.apply')}
              <Arrow className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-xl">
              {t('hero.learn')}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              { value: '4', label: language === 'en' ? 'Departments' : language === 'ar' ? 'أقسام' : 'بەش' },
              { value: '5', label: language === 'en' ? 'Years' : language === 'ar' ? 'سنوات' : 'ساڵ' },
              { value: '500+', label: language === 'en' ? 'Students' : language === 'ar' ? 'طالب' : 'قوتابی' },
              { value: '50+', label: language === 'en' ? 'Teachers' : language === 'ar' ? 'مدرس' : 'مامۆستا' },
            ].map((stat, index) => (
              <div key={index} className="text-center p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
