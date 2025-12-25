import { useLanguage } from '@/contexts/LanguageContext';
import { WebsiteHeader } from '@/components/website/WebsiteHeader';
import { HeroSection } from '@/components/website/HeroSection';
import { DepartmentsSection } from '@/components/website/DepartmentsSection';
import { ActivitiesSection } from '@/components/website/ActivitiesSection';
import { ContactSection } from '@/components/website/ContactSection';
import { Footer } from '@/components/website/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export const PublicWebsite = () => {
  const { t, dir, language } = useLanguage();

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <WebsiteHeader />
      <HeroSection />
      <DepartmentsSection />
      <ActivitiesSection />
      
      {/* About Section */}
      <section id="about" className="py-24" dir={dir}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">{t('about.title')}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-8">{t('about.title')}</h2>
            <Card className="border-border/50">
              <CardContent className="p-8">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {t('about.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <ContactSection />
      <Footer />
    </div>
  );
};
