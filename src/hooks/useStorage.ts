import { supabase } from '@/integrations/supabase/client';
import { getStorageType, getR2Config } from '@/components/settings/StorageSettings';

export async function uploadStudentPhoto(file: File, studentId: string): Promise<string | null> {
  try {
    const storageType = getStorageType();

    if (storageType === 'r2') {
      const config = getR2Config();
      if (!config) {
        console.error('R2 config not found');
        return null;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('accountId', config.accountId);
      formData.append('accessKeyId', config.accessKeyId);
      formData.append('secretAccessKey', config.secretAccessKey);
      formData.append('bucketName', config.bucketName);
      formData.append('publicDomain', config.publicDomain || '');
      formData.append('folder', 'student-photos');

      const { data, error } = await supabase.functions.invoke('upload-to-r2', {
        body: formData,
      });

      if (error) throw error;
      if (data?.url) return data.url;
      throw new Error('No URL returned from R2');
    }

    // Lovable Cloud Storage (default)
    const fileExt = file.name.split('.').pop();
    const fileName = `${studentId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('student-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('student-photos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading photo:', error);
    return null;
  }
}

export async function deleteStudentPhoto(photoUrl: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const url = new URL(photoUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];

    const { error } = await supabase.storage
      .from('student-photos')
      .remove([fileName]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
}
