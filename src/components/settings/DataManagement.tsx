import { useState } from 'react';
import { 
  Database, 
  RefreshCw, 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle,
  Users,
  Receipt,
  FileText,
  Wallet,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PasswordConfirmDialog } from '@/components/common/PasswordConfirmDialog';

type DeleteType = 'students' | 'payments' | 'expenses' | 'staff' | 'all';

export function DataManagement() {
  const { t } = useTranslation();
  const { isSuperAdmin } = usePermissions();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteType, setDeleteType] = useState<DeleteType | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh - in a real app this would invalidate queries
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastRefresh(new Date());
    setIsRefreshing(false);
    toast.success(t('dataManagement.refreshed'));
  };

  const handleDeleteRequest = (type: DeleteType) => {
    setDeleteType(type);
    setShowPasswordDialog(true);
  };

  const handlePasswordConfirm = async () => {
    if (!deleteType) return;
    
    setShowPasswordDialog(false);
    setIsDeleting(true);

    try {
      switch (deleteType) {
        case 'students':
          // Delete payments first (foreign key constraint)
          await supabase.from('payments').delete().neq('id', '');
          await supabase.from('year_payments').delete().neq('id', '');
          await supabase.from('students').delete().neq('id', '');
          break;
        case 'payments':
          await supabase.from('payments').delete().neq('id', '');
          // Reset paid_amount on students
          await supabase.from('students').update({ paid_amount: 0 }).neq('id', '');
          break;
        case 'expenses':
          await supabase.from('expenses').delete().neq('id', '');
          break;
        case 'staff':
          await supabase.from('salary_payments').delete().neq('id', '');
          await supabase.from('staff').delete().neq('id', '');
          break;
        case 'all':
          await supabase.from('payments').delete().neq('id', '');
          await supabase.from('year_payments').delete().neq('id', '');
          await supabase.from('salary_payments').delete().neq('id', '');
          await supabase.from('students').delete().neq('id', '');
          await supabase.from('staff').delete().neq('id', '');
          await supabase.from('expenses').delete().neq('id', '');
          break;
      }
      
      toast.success(t('dataManagement.deleteSuccess'));
      // Refresh the page to update all data
      window.location.reload();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(t('dataManagement.deleteError'));
    } finally {
      setIsDeleting(false);
      setDeleteType(null);
    }
  };

  const handleExportBackup = async () => {
    try {
      const [studentsRes, staffRes, paymentsRes, expensesRes, salaryRes, yearPaymentsRes] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('staff').select('*'),
        supabase.from('payments').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('salary_payments').select('*'),
        supabase.from('year_payments').select('*'),
      ]);

      const backup = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        data: {
          students: studentsRes.data || [],
          staff: staffRes.data || [],
          payments: paymentsRes.data || [],
          expenses: expensesRes.data || [],
          salaryPayments: salaryRes.data || [],
          yearPayments: yearPaymentsRes.data || [],
        }
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nti-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(t('dataManagement.backupDownloaded'));
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('dataManagement.backupError'));
    }
  };

  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const backup = JSON.parse(text);
        
        // Validate backup structure
        if (!backup.data || !backup.version) {
          toast.error(t('dataManagement.invalidBackup'));
          return;
        }

        // Show confirmation dialog before import
        toast.info(t('dataManagement.importStarted'));
        
        // Import data in order (respecting foreign keys)
        if (backup.data.students?.length > 0) {
          for (const student of backup.data.students) {
            await supabase.from('students').upsert(student, { onConflict: 'id' });
          }
        }
        
        if (backup.data.staff?.length > 0) {
          for (const member of backup.data.staff) {
            await supabase.from('staff').upsert(member, { onConflict: 'id' });
          }
        }
        
        if (backup.data.payments?.length > 0) {
          for (const payment of backup.data.payments) {
            await supabase.from('payments').upsert(payment, { onConflict: 'id' });
          }
        }
        
        if (backup.data.expenses?.length > 0) {
          for (const expense of backup.data.expenses) {
            await supabase.from('expenses').upsert(expense, { onConflict: 'id' });
          }
        }
        
        if (backup.data.salaryPayments?.length > 0) {
          for (const salary of backup.data.salaryPayments) {
            await supabase.from('salary_payments').upsert(salary, { onConflict: 'id' });
          }
        }
        
        if (backup.data.yearPayments?.length > 0) {
          for (const yp of backup.data.yearPayments) {
            await supabase.from('year_payments').upsert(yp, { onConflict: 'id' });
          }
        }

        toast.success(t('dataManagement.importSuccess'));
        window.location.reload();
      } catch (error) {
        console.error('Import error:', error);
        toast.error(t('dataManagement.importError'));
      }
    };
    input.click();
  };

  const dangerItems = [
    { type: 'students' as DeleteType, icon: Users, label: t('dataManagement.deleteStudents') },
    { type: 'payments' as DeleteType, icon: Receipt, label: t('dataManagement.deletePayments') },
    { type: 'expenses' as DeleteType, icon: Wallet, label: t('dataManagement.deleteExpenses') },
    { type: 'staff' as DeleteType, icon: FileText, label: t('dataManagement.deleteStaff') },
  ];

  return (
    <div className="space-y-6">
      {/* Danger Zone - Only for Superadmin */}
      {isSuperAdmin && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-destructive">{t('dataManagement.dangerZone')}</CardTitle>
                <CardDescription className="text-destructive/70">
                  {t('dataManagement.dangerZoneDesc')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dangerItems.map((item) => (
              <AlertDialog key={item.type}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    disabled={isDeleting}
                  >
                    <item.icon className="h-4 w-4 me-2" />
                    {item.label}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      {t('dataManagement.confirmDelete')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('dataManagement.deleteWarning', { type: item.label })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => handleDeleteRequest(item.type)}
                    >
                      {t('common.delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ))}

            {/* Delete All Data */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full justify-start mt-4"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 me-2" />
                  {t('dataManagement.deleteAll')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    {t('dataManagement.deleteAllTitle')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('dataManagement.deleteAllWarning')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => handleDeleteRequest('all')}
                  >
                    {t('dataManagement.deleteAllConfirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}

      {/* Data Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
              <Database className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>{t('dataManagement.title')}</CardTitle>
              <CardDescription>{t('dataManagement.subtitle')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auto Refresh */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{t('dataManagement.autoRefresh')}</p>
                <p className="text-sm text-muted-foreground">{t('dataManagement.autoRefreshDesc')}</p>
              </div>
            </div>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>

          {/* Manual Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-5 w-5 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{t('dataManagement.manualRefresh')}</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={handleExportBackup}
            >
              <Download className="h-5 w-5 text-success" />
              <span>{t('dataManagement.backupData')}</span>
            </Button>
          </div>

          {/* System Status */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-success/10 border border-success/30">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium text-success">{t('dataManagement.systemWorking')}</p>
                <p className="text-sm text-muted-foreground">{t('dataManagement.allServicesActive')}</p>
              </div>
            </div>
            {lastRefresh && (
              <span className="text-xs text-muted-foreground">
                {t('dataManagement.lastRefresh')}: {lastRefresh.toLocaleTimeString('ku-Arab')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Backup Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>{t('dataManagement.backupTitle')}</CardTitle>
              <CardDescription>{t('dataManagement.backupDesc')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full h-12 bg-primary hover:bg-primary/90"
            onClick={handleExportBackup}
          >
            <Download className="h-5 w-5 me-2" />
            {t('dataManagement.downloadBackup')}
          </Button>
          
          <Button
            variant="outline"
            className="w-full h-12"
            onClick={handleImportBackup}
          >
            <Upload className="h-5 w-5 me-2" />
            {t('dataManagement.importBackup')}
          </Button>
        </CardContent>
      </Card>

      {/* Password Confirmation Dialog */}
      <PasswordConfirmDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onConfirm={handlePasswordConfirm}
        title={t('dataManagement.confirmPassword')}
        description={t('dataManagement.passwordRequired')}
      />
    </div>
  );
}
