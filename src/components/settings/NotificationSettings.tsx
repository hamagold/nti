import { useState } from 'react';
import { Bell, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettingsStore } from '@/store/settingsStore';
import { useToast } from '@/hooks/use-toast';

export function NotificationSettings() {
  const { notificationDays, setNotificationDays, addActivityLog } = useSettingsStore();
  const { toast } = useToast();
  const [days, setDays] = useState(notificationDays.toString());

  const handleSave = () => {
    const numDays = parseInt(days) || 50;
    setNotificationDays(numDays);
    
    addActivityLog({
      type: 'settings',
      description: `گۆرینی ماوەی ئاگاداری بۆ ${numDays} ڕۆژ`,
      user: 'ئەدمین',
    });
    
    toast({
      title: 'پاشەکەوتکرا',
      description: `ئاگاداری بۆ قوتابیانی پارەیان نەداوە لە ${numDays} ڕۆژی ڕابردوو`,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-foreground flex items-center gap-2">
        <Bell className="h-5 w-5 text-warning" />
        ڕێکخستنی ئاگاداریەکان
      </h3>

      <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
        <p className="text-sm text-foreground mb-4">
          سیستەم ئاگاداریت ئەکاتەوە ئەگەر قوتابیەک لە ماوەی دیاریکراو پارەی نەداوە
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <Label>ماوەی ئاگاداری (بە ڕۆژ)</Label>
            <Input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              min="1"
              max="365"
            />
          </div>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 ml-2" />
            پاشەکەوت
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          ئەگەر قوتابیەک لە {days} ڕۆژی ڕابردوو پارەی نەداوە، لە بەشی ئاگاداریەکان نیشان ئەدرێت
        </p>
      </div>
    </div>
  );
}
