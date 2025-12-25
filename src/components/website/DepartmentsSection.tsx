import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Fuel, Calculator, Briefcase, BookOpen, GraduationCap } from 'lucide-react';

const departments = [
  {
    id: 'computer',
    icon: Monitor,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    years: ['computer.year1', 'computer.year2', 'computer.year3', 'computer.year4', 'computer.year5'],
  },
  {
    id: 'patrol',
    icon: Fuel,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-500/10',
    years: ['patrol.year1', 'patrol.year2', 'patrol.year3', 'patrol.year4', 'patrol.year5'],
  },
  {
    id: 'accounting',
    icon: Calculator,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    years: ['accounting.year1', 'accounting.year2', 'accounting.year3', 'accounting.year4', 'accounting.year5'],
  },
  {
    id: 'admin',
    icon: Briefcase,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    years: ['admin.year1', 'admin.year2', 'admin.year3', 'admin.year4', 'admin.year5'],
  },
];

export const DepartmentsSection = () => {
  const { t, dir } = useLanguage();

  return (
    <section id="departments" className="py-24 bg-muted/30" dir={dir}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t('dept.title')}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">{t('dept.title')}</h2>
        </div>

        {/* Departments Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {departments.map((dept) => {
            const Icon = dept.icon;
            return (
              <Card key={dept.id} className="overflow-hidden border-border/50 hover:shadow-xl transition-all duration-300 group">
                <CardHeader className={`${dept.bgColor} p-6`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${dept.color} text-white shadow-lg`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{t(`dept.${dept.id}`)}</h3>
                      <p className="text-muted-foreground">{t(`dept.${dept.id}.desc`)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {t('dept.years')}
                    </span>
                    <span>{t('dept.rooms')}</span>
                  </div>

                  <Tabs defaultValue="1" className="w-full">
                    <TabsList className="grid grid-cols-5 gap-1 bg-muted/50 p-1 rounded-xl">
                      {[1, 2, 3, 4, 5].map((year) => (
                        <TabsTrigger
                          key={year}
                          value={year.toString()}
                          className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
                        >
                          {t(`year.${year}`).split(' ')[1] || year}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {[1, 2, 3, 4, 5].map((year) => (
                      <TabsContent key={year} value={year.toString()} className="mt-4">
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                          <h4 className="font-semibold text-foreground mb-2">{t(`year.${year}`)}</h4>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {t(dept.years[year - 1])}
                          </p>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
