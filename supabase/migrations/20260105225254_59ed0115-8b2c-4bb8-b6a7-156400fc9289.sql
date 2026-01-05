-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('superadmin', 'admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Superadmins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'superadmin'));

-- Create storage bucket for student photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-photos', 'student-photos', true);

-- Storage policies for student photos
CREATE POLICY "Anyone can view student photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'student-photos');

CREATE POLICY "Authenticated users can upload student photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'student-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update student photos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'student-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete student photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'student-photos' AND auth.role() = 'authenticated');