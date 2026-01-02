import { Trash2, DollarSign, UserPlus, UserMinus, Briefcase, Settings, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSettingsStore, ActivityLog } from '@/store/settingsStore';
import { formatCurrency } from '@/types';
import { cn } from '@/lib/utils';

const getLogIcon = (type: ActivityLog['type']) => {
  switch (type) {
    case 'payment':
      return DollarSign;
    case 'student_add':
      return UserPlus;
    case 'student_delete':
      return UserMinus;
    case 'staff_add':
      return Briefcase;
    case 'staff_delete':
      return UserMinus;
    case 'salary':
      return Receipt;
    case 'expense':
      return DollarSign;
    case 'settings':
      return Settings;
    default:
      return Settings;
  }
};

const getLogColor = (type: ActivityLog['type']) => {
  switch (type) {
    case 'payment':
      return 'text-success bg-success/10';
    case 'student_add':
    case 'staff_add':
      return 'text-primary bg-primary/10';
    case 'student_delete':
    case 'staff_delete':
      return 'text-destructive bg-destructive/10';
    case 'salary':
      return 'text-warning bg-warning/10';
    case 'expense':
      return 'text-destructive bg-destructive/10';
    case 'settings':
      return 'text-muted-foreground bg-muted';
    default:
      return 'text-muted-foreground bg-muted';
  }
};

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('ku-Arab', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function ActivityLogView() {
  const { activityLog, clearActivityLog } = useSettingsStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground">کۆتا گۆرانکاریەکان</h3>
        {activityLog.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={clearActivityLog}
          >
            <Trash2 className="h-4 w-4 ml-2" />
            سڕینەوەی هەموو
          </Button>
        )}
      </div>

      {activityLog.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>هیچ گۆرانکاریەک تۆمار نەکراوە</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {activityLog.map((log) => {
              const Icon = getLogIcon(log.type);
              const colorClass = getLogColor(log.type);
              
              return (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-muted/50 border border-border flex items-start gap-3"
                >
                  <div
                    className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
                      colorClass
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">
                      {log.description}
                    </p>
                    {log.amount && (
                      <p className="text-sm text-success font-bold mt-1">
                        {formatCurrency(log.amount)}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {log.user}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
