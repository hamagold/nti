import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getStorageType, getR2Config } from '@/components/settings/StorageSettings';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  folder?: string;
  className?: string;
}

export function ImageUpload({ onUpload, folder = 'uploads', className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const storageType = getStorageType();

      if (storageType === 'r2') {
        const config = getR2Config();
        if (!config) {
          toast.error('تکایە ڕێکخستنەکانی R2 پڕبکەوە لە ڕێکخستنەکان');
          return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('accountId', config.accountId);
        formData.append('accessKeyId', config.accessKeyId);
        formData.append('secretAccessKey', config.secretAccessKey);
        formData.append('bucketName', config.bucketName);
        formData.append('publicDomain', config.publicDomain || '');
        formData.append('folder', folder);

        const { data, error } = await supabase.functions.invoke('upload-to-r2', {
          body: formData,
        });

        if (error) throw error;
        if (data?.url) {
          onUpload(data.url);
          toast.success('وێنە بە سەرکەوتوویی بارکرا بۆ R2');
        } else {
          throw new Error('No URL returned');
        }
      } else {
        // Lovable Cloud Storage (Supabase)
        const ext = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('student-photos')
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('student-photos')
          .getPublicUrl(fileName);

        onUpload(urlData.publicUrl);
        toast.success('وێنە بە سەرکەوتوویی بارکرا');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'هەڵە لە بارکردنی وێنە');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  return (
    <div className={`flex gap-2 ${className || ''}`}>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => fileRef.current?.click()}
        className="gap-2"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        هەڵبژاردنی وێنە
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => cameraRef.current?.click()}
        className="gap-2"
      >
        <Camera className="h-4 w-4" />
        کامێرا
      </Button>
    </div>
  );
}
