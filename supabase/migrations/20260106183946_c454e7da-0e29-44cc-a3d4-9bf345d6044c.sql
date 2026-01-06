-- Enable realtime for role_permissions table so changes sync across all users
ALTER PUBLICATION supabase_realtime ADD TABLE public.role_permissions;