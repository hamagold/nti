import { ShieldAlert, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UnauthorizedProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function Unauthorized({
  title = '403 - ڕێگە پێنەدراوە',
  description = 'تۆ دەسەڵاتت نییە بۆ بینینی ئەم لاپەڕەیە.',
  actionLabel = 'گەڕانەوە',
  onAction,
}: UnauthorizedProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <ShieldAlert className="h-6 w-6 text-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        {onAction && (
          <div className="mt-6 flex justify-end">
            <Button onClick={onAction} className="gap-2">
              <ArrowRight className="h-4 w-4" />
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
