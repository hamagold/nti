import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Cloud, HardDrive, Eye, EyeOff, Save, Loader2 } from 'lucide-react';
import { useAppSettings, useUpdateAppSettings, type StorageType, type R2Config } from '@/hooks/useAppSettings';

export type { StorageType, R2Config };

// Re-export helpers for backward compatibility
export { fetchStorageSettings as getStorageSettingsAsync } from '@/hooks/useAppSettings';

export function StorageSettings() {
  const { data: settings, isLoading } = useAppSettings();
  const updateMutation = useUpdateAppSettings();
  const [storageType, setStorageType] = useState<StorageType>('cloud');
  const [showSecret, setShowSecret] = useState(false);
  const [r2Config, setR2Config] = useState<R2Config>({
    accountId: '',
    accessKeyId: '',
    secretAccessKey: '',
    bucketName: '',
    publicDomain: '',
  });

  useEffect(() => {
    if (settings) {
      setStorageType(settings.storageType);
      if (settings.r2Config) {
        setR2Config(settings.r2Config);
      }
    }
  }, [settings]);

  const handleSave = () => {
    if (storageType === 'r2') {
      if (!r2Config.accountId || !r2Config.accessKeyId || !r2Config.secretAccessKey || !r2Config.bucketName) {
        toast.error('تکایە هەموو خانە پێویستەکان پڕبکەوە');
        return;
      }
    }

    updateMutation.mutate(
      { storageType, r2Config: storageType === 'r2' ? r2Config : undefined },
      {
        onSuccess: () => toast.success('ڕێکخستنەکانی هەڵگرتن پاشەکەوت کران'),
        onError: () => toast.error('هەڵە لە پاشەکەوتکردن'),
      }
    );
  };

  const updateR2 = (key: keyof R2Config, value: string) => {
    setR2Config(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <RadioGroup value={storageType} onValueChange={(v) => setStorageType(v as StorageType)} className="space-y-3">
        <div className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors cursor-pointer">
          <RadioGroupItem value="cloud" id="cloud" />
          <Label htmlFor="cloud" className="flex items-center gap-2 cursor-pointer flex-1">
            <Cloud className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Lovable Cloud Storage</p>
              <p className="text-sm text-muted-foreground">هەڵگرتنی وێنە لە کلاود (بنەڕەتی)</p>
            </div>
          </Label>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors cursor-pointer">
          <RadioGroupItem value="r2" id="r2" />
          <Label htmlFor="r2" className="flex items-center gap-2 cursor-pointer flex-1">
            <HardDrive className="h-5 w-5 text-accent-foreground" />
            <div>
              <p className="font-medium text-foreground">Cloudflare R2</p>
              <p className="text-sm text-muted-foreground">هەڵگرتنی وێنە لە Cloudflare R2</p>
            </div>
          </Label>
        </div>
      </RadioGroup>

      {storageType === 'r2' && (
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-lg">ڕێکخستنەکانی Cloudflare R2</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Account ID</Label>
              <Input value={r2Config.accountId} onChange={e => updateR2('accountId', e.target.value)} placeholder="ناسنامەی هەژمار" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>Access Key ID</Label>
              <Input value={r2Config.accessKeyId} onChange={e => updateR2('accessKeyId', e.target.value)} placeholder="ناسنامەی کلیلی دەستگەیشتن" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>Secret Access Key</Label>
              <div className="relative">
                <Input type={showSecret ? 'text' : 'password'} value={r2Config.secretAccessKey} onChange={e => updateR2('secretAccessKey', e.target.value)} placeholder="کلیلی نهێنی" dir="ltr" className="pe-10" />
                <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground hover:text-foreground">
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bucket Name</Label>
              <Input value={r2Config.bucketName} onChange={e => updateR2('bucketName', e.target.value)} placeholder="ناوی باکەت" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>Public Domain (ئارەزوومەندانە)</Label>
              <Input value={r2Config.publicDomain} onChange={e => updateR2('publicDomain', e.target.value)} placeholder="https://pub-xxxx.r2.dev" dir="ltr" />
              <p className="text-xs text-muted-foreground">دۆمەینی گشتی باکەتەکە بۆ نیشاندانی وێنەکان. دەبێت دەستگەیشتنی گشتی چالاک بێت.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleSave} className="gap-2" disabled={updateMutation.isPending}>
        {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        پاشەکەوتکردن
      </Button>
    </div>
  );
}
