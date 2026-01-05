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
import { Lock, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';

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
  const [isVerifying, setIsVerifying] = useState(false);
  const { currentUser } = useAuthStore();

  const handleConfirm = async () => {
    if (!password.trim()) {
      toast.error('تکایە پاسۆرد بنوسە');
      return;
    }

    if (!currentUser) {
      toast.error('چوونەژورەوە نەکراوە');
      return;
    }

    setIsVerifying(true);
    try {
      // Verify password by attempting to sign in with current credentials
      const { error } = await supabase.auth.signInWithPassword({
        email: currentUser,
        password: password,
      });

      if (error) {
        toast.error('پاسۆرد هەڵەیە');
        return;
      }

      onConfirm();
      setPassword('');
      onOpenChange(false);
    } catch (error) {
      toast.error('هەڵە لە پشتڕاستکردنەوە');
    } finally {
      setIsVerifying(false);
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
            disabled={isVerifying}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isVerifying ? (
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
            ) : null}
            دڵنیام سڕینەوە
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}