-- Create role_permissions table to store permissions for each role in the database
CREATE TABLE public.role_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role text NOT NULL UNIQUE,
  permissions text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read permissions (they need to know what they can do)
CREATE POLICY "Authenticated users can view role permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (true);

-- Only superadmins can modify permissions
CREATE POLICY "Superadmins can manage role permissions"
ON public.role_permissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'superadmin'::app_role));

-- Insert default permissions for each role
INSERT INTO public.role_permissions (role, permissions) VALUES
('superadmin', ARRAY['view_dashboard', 'view_students', 'view_staff', 'view_payments', 'view_expenses', 'view_invoices', 'view_reports', 'view_settings', 'add_student', 'edit_student', 'delete_student', 'add_staff', 'edit_staff', 'delete_staff', 'add_payment', 'add_expense', 'edit_expense', 'delete_expense', 'add_salary', 'manage_departments', 'manage_admins', 'manage_contact', 'manage_notifications', 'view_logs']),
('admin', ARRAY['view_dashboard', 'view_students', 'view_staff', 'view_payments', 'view_expenses', 'view_invoices', 'view_reports', 'view_settings', 'view_logs']),
('staff', ARRAY['view_dashboard', 'view_students', 'add_student', 'edit_student', 'add_payment', 'view_staff', 'add_staff', 'view_payments', 'view_invoices']),
('local_staff', ARRAY['add_student', 'add_staff']);

-- Trigger to update updated_at
CREATE TRIGGER update_role_permissions_updated_at
BEFORE UPDATE ON public.role_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();