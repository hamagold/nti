-- Create admin_profiles table to store admin emails
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for admin_profiles
CREATE POLICY "Authenticated users can view admin profiles"
ON public.admin_profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Superadmins can manage admin profiles"
ON public.admin_profiles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));