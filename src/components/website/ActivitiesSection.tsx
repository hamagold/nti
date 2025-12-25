import { useLanguage } from '@/contexts/LanguageContext';
import { useWebsiteStore } from '@/store/websiteStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, ArrowRight, Newspaper } from 'lucide-react';

export const ActivitiesSection = () => {
  const { t, dir, language } = useLanguage();
  const { activities } = useWebsiteStore();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section id="activities" className="py-24" dir={dir}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Newspaper className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t('activities.title')}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">{t('activities.title')}</h2>
        </div>

        {/* Activities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity) => (
            <Card key={activity.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50">
              <div className="relative overflow-hidden aspect-video">
                <img
                  src={activity.image}
                  alt={activity.title[language]}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 right-4 left-4">
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Calendar className="h-4 w-4" />
                    {new Date(activity.date).toLocaleDateString(
                      language === 'en' ? 'en-US' : language === 'ar' ? 'ar-IQ' : 'ku-IQ'
                    )}
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-1">
                  {activity.title[language]}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {activity.description[language]}
                </p>
                <Button variant="ghost" className="gap-2 p-0 h-auto text-primary hover:text-primary/80">
                  {t('activities.readMore')}
                  <Arrow className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
