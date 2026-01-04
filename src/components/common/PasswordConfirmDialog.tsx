import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Lock, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';

interface PasswordConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export function PasswordConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'دڵنیایی لە سڕینەوە',
  description = 'تکایە پاسۆردی ئەدمین بنوسە بۆ دڵنیابوون',
}: PasswordConfirmDialogProps) {
  const [password, setPassword] = useState('');
  const { currentUser } = useAuthStore();
  const { admins } = useSettingsStore();

  const handleConfirm = () => {
    // Find current logged in admin and verify their password
    const currentAdmin = admins.find(a => a.username === currentUser);
    
    if (currentAdmin && password === currentAdmin.password) {
      onConfirm();
      setPassword('');
      onOpenChange(false);
    } else {
      toast.error('پاسۆرد هەڵەیە');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) setPassword('');
      onOpenChange(isOpen);
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-3 py-4">
          <Label htmlFor="admin-password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            پاسۆردی ئەدمین
          </Label>
          <Input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="پاسۆردی ئەدمین بنوسە"
            className="bg-muted/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleConfirm();
              }
            }}
          />
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setPassword('');
              onOpenChange(false);
            }}
          >
            پاشگەزبوونەوە
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            دڵنیام سڕینەوە
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}