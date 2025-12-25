import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export const ContactSection = () => {
  const { t, dir, language } = useLanguage();

  const contactInfo = [
    {
      icon: MapPin,
      title: t('contact.address'),
      value: language === 'en' ? 'Erbil, Kurdistan Region, Iraq' : language === 'ar' ? 'أربيل، إقليم كردستان، العراق' : 'هەولێر، هەرێمی کوردستان، عێراق',
    },
    {
      icon: Phone,
      title: t('contact.phone'),
      value: '+964 750 123 4567',
    },
    {
      icon: Mail,
      title: t('contact.email'),
      value: 'info@nti.edu.iq',
    },
    {
      icon: Clock,
      title: language === 'en' ? 'Working Hours' : language === 'ar' ? 'ساعات العمل' : 'کاتی کارکردن',
      value: language === 'en' ? 'Sun - Thu: 8AM - 3PM' : language === 'ar' ? 'الأحد - الخميس: ٨ص - ٣م' : 'یەکشەممە - پێنجشەممە: ٨ بەیانی - ٣ ئێوارە',
    },
  ];

  return (
    <section id="contact" className="py-24 bg-muted/30" dir={dir}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t('contact.title')}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">{t('contact.title')}</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Info Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <Card key={index} className="border-border/50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                        <p className="text-muted-foreground text-sm">{info.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Map */}
          <Card className="border-border/50 overflow-hidden">
            <CardContent className="p-0">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d51894.42652119916!2d44.0092!3d36.1911!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40072f9d4e3c9f47%3A0x4e3b2a4e3b2a4e3b!2sErbil!5e0!3m2!1sen!2siq!4v1234567890"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
                className="grayscale hover:grayscale-0 transition-all duration-500"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
