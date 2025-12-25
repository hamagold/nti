import { Header } from '@/components/layout/Header';
import { DEPARTMENTS, formatCurrency } from '@/types';
import { Settings as SettingsIcon, Building2, GraduationCap } from 'lucide-react';

export default function Settings() {
  return (
    <div className="min-h-screen pb-8">
      <Header
        title="ڕێکخستنەکان"
        subtitle="ڕێکخستنی سیستەم و زانیاری پەیمانگا"
      />

      <div className="p-8 space-y-8">
        {/* Institute Info */}
        <div className="rounded-2xl bg-card p-8 shadow-lg animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">زانیاری پەیمانگا</h2>
              <p className="text-sm text-muted-foreground">زانیاری سەرەکی</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between p-4 rounded-xl bg-muted/50">
              <span className="text-muted-foreground">ناوی پەیمانگا:</span>
              <span className="font-bold">پەیمانگای تەکنیکی نیشتمانی</span>
            </div>
            <div className="flex justify-between p-4 rounded-xl bg-muted/50">
              <span className="text-muted-foreground">ژمارەی بەشەکان:</span>
              <span className="font-bold">4 بەش</span>
            </div>
            <div className="flex justify-between p-4 rounded-xl bg-muted/50">
              <span className="text-muted-foreground">ژوورەکان بۆ هەر بەشێک:</span>
              <span className="font-bold">A, B, C</span>
            </div>
            <div className="flex justify-between p-4 rounded-xl bg-muted/50">
              <span className="text-muted-foreground">ماوەی خوێندن:</span>
              <span className="font-bold">5 ساڵ</span>
            </div>
          </div>
        </div>

        {/* Departments */}
        <div className="rounded-2xl bg-card p-8 shadow-lg animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl gradient-secondary flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">بەشەکان و کرێ</h2>
              <p className="text-sm text-muted-foreground">کرێی سالانەی هەر بەشێک</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {DEPARTMENTS.map((dept, index) => (
              <div
                key={dept.id}
                className="p-6 rounded-xl bg-muted/50 border border-border animate-slide-up"
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{dept.icon}</span>
                  <div>
                    <p className="font-bold text-lg text-foreground">{dept.name}</p>
                    <p className="text-sm text-muted-foreground">بەشی {dept.id}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">کرێی سالانە:</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(dept.yearlyFee)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Developer Info */}
        <div className="rounded-2xl bg-card p-8 shadow-lg animate-slide-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center">
              <SettingsIcon className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">دەربارەی سیستەم</h2>
              <p className="text-sm text-muted-foreground">زانیاری دروستکەر</p>
            </div>
          </div>

          <div className="text-center py-8">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full gradient-hero mb-4">
              <span className="text-3xl">👨‍💻</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              محمد سلێمان احمد
            </h3>
            <p className="text-muted-foreground">
              دروستکەری سیستەمی بەڕێوەبردنی پەیمانگای تەکنیکی نیشتمانی
            </p>
            <div className="mt-6 inline-block px-6 py-2 rounded-full bg-muted text-sm text-muted-foreground">
              وەشان ١.٠.٠
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
