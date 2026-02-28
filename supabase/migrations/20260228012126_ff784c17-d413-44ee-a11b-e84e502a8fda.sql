
CREATE TABLE public.app_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  storage_type TEXT NOT NULL DEFAULT 'cloud',
  r2_account_id TEXT,
  r2_access_key_id TEXT,
  r2_secret_access_key TEXT,
  r2_bucket_name TEXT,
  r2_public_domain TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default row
INSERT INTO public.app_settings (id, storage_type) VALUES ('default', 'cloud');

-- RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read settings
CREATE POLICY "Authenticated users can read settings" ON public.app_settings
  FOR SELECT TO authenticated USING (true);

-- Only authenticated users can update settings
CREATE POLICY "Authenticated users can update settings" ON public.app_settings
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
