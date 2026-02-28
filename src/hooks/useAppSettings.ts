import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type StorageType = 'cloud' | 'r2';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain: string;
}

export interface AppSettings {
  storageType: StorageType;
  r2Config: R2Config | null;
}

export function useAppSettings() {
  return useQuery({
    queryKey: ['app-settings'],
    staleTime: 60000,
    queryFn: async (): Promise<AppSettings> => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 'default')
        .single();

      if (error || !data) {
        return { storageType: 'cloud', r2Config: null };
      }

      const row = data as any;
      return {
        storageType: (row.storage_type || 'cloud') as StorageType,
        r2Config: row.r2_access_key_id ? {
          accountId: row.r2_account_id || '',
          accessKeyId: row.r2_access_key_id || '',
          secretAccessKey: row.r2_secret_access_key || '',
          bucketName: row.r2_bucket_name || '',
          publicDomain: row.r2_public_domain || '',
        } : null,
      };
    },
  });
}

export function useUpdateAppSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: { storageType: StorageType; r2Config?: R2Config }) => {
      const updateData: any = {
        storage_type: settings.storageType,
        updated_at: new Date().toISOString(),
      };

      if (settings.r2Config) {
        updateData.r2_account_id = settings.r2Config.accountId;
        updateData.r2_access_key_id = settings.r2Config.accessKeyId;
        updateData.r2_secret_access_key = settings.r2Config.secretAccessKey;
        updateData.r2_bucket_name = settings.r2Config.bucketName;
        updateData.r2_public_domain = settings.r2Config.publicDomain;
      }

      const { error } = await supabase
        .from('app_settings')
        .update(updateData)
        .eq('id', 'default');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
    },
  });
}

// Helper functions for use outside of React components
let cachedSettings: AppSettings | null = null;

export async function fetchStorageSettings(): Promise<AppSettings> {
  if (cachedSettings) return cachedSettings;
  
  const { data } = await supabase
    .from('app_settings')
    .select('*')
    .eq('id', 'default')
    .single();

  if (!data) return { storageType: 'cloud', r2Config: null };

  const row = data as any;
  cachedSettings = {
    storageType: (row.storage_type || 'cloud') as StorageType,
    r2Config: row.r2_access_key_id ? {
      accountId: row.r2_account_id || '',
      accessKeyId: row.r2_access_key_id || '',
      secretAccessKey: row.r2_secret_access_key || '',
      bucketName: row.r2_bucket_name || '',
      publicDomain: row.r2_public_domain || '',
    } : null,
  };

  // Clear cache after 60s
  setTimeout(() => { cachedSettings = null; }, 60000);

  return cachedSettings;
}
