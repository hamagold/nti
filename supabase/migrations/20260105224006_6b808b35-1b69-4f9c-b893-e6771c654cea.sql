-- Create ENUM types
CREATE TYPE public.department_type AS ENUM ('computer', 'patrol', 'accounting', 'administrator');
CREATE TYPE public.room_type AS ENUM ('A', 'B', 'C');
CREATE TYPE public.staff_role_type AS ENUM ('teacher', 'employee');
CREATE TYPE public.expense_type AS ENUM ('electricity', 'water', 'other');

-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  photo_url TEXT,
  department department_type NOT NULL,
  room room_type NOT NULL,
  year INTEGER NOT NULL DEFAULT 1 CHECK (year >= 1 AND year <= 5),
  total_fee NUMERIC NOT NULL DEFAULT 0,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create year_payments table for tracking 5 years of payments
CREATE TABLE public.year_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year >= 1 AND year <= 5),
  total_fee NUMERIC NOT NULL DEFAULT 0,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, year)
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create staff table
CREATE TABLE public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role staff_role_type NOT NULL,
  department department_type,
  salary NUMERIC NOT NULL DEFAULT 0,
  join_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create salary_payments table
CREATE TABLE public.salary_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  amount NUMERIC NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type expense_type NOT NULL,
  amount NUMERIC NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.year_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (admin system)
-- Students policies
CREATE POLICY "Authenticated users can view students" 
ON public.students FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert students" 
ON public.students FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update students" 
ON public.students FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete students" 
ON public.students FOR DELETE 
TO authenticated 
USING (true);

-- Year payments policies
CREATE POLICY "Authenticated users can view year_payments" 
ON public.year_payments FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert year_payments" 
ON public.year_payments FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update year_payments" 
ON public.year_payments FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete year_payments" 
ON public.year_payments FOR DELETE 
TO authenticated 
USING (true);

-- Payments policies
CREATE POLICY "Authenticated users can view payments" 
ON public.payments FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert payments" 
ON public.payments FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update payments" 
ON public.payments FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete payments" 
ON public.payments FOR DELETE 
TO authenticated 
USING (true);

-- Staff policies
CREATE POLICY "Authenticated users can view staff" 
ON public.staff FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert staff" 
ON public.staff FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update staff" 
ON public.staff FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete staff" 
ON public.staff FOR DELETE 
TO authenticated 
USING (true);

-- Salary payments policies
CREATE POLICY "Authenticated users can view salary_payments" 
ON public.salary_payments FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert salary_payments" 
ON public.salary_payments FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update salary_payments" 
ON public.salary_payments FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete salary_payments" 
ON public.salary_payments FOR DELETE 
TO authenticated 
USING (true);

-- Expenses policies
CREATE POLICY "Authenticated users can view expenses" 
ON public.expenses FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert expenses" 
ON public.expenses FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update expenses" 
ON public.expenses FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete expenses" 
ON public.expenses FOR DELETE 
TO authenticated 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();