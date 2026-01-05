import { supabase } from '@/integrations/supabase/client';

export async function uploadStudentPhoto(file: File, studentId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${studentId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('student-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('student-photos')
      .getPublicUrl(filePath);

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
