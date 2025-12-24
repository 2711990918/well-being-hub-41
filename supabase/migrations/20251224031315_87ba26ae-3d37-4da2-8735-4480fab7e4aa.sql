-- Add 'consultant' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'consultant';

-- Create consultant_profiles table for storing consultant-specific information
CREATE TABLE public.consultant_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  specialty TEXT NOT NULL DEFAULT '心理咨询',
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 5.0,
  total_consultations INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  hourly_rate NUMERIC DEFAULT 100,
  certifications TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consultant_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for consultant_profiles
CREATE POLICY "Consultant profiles are viewable by everyone"
ON public.consultant_profiles
FOR SELECT
USING (true);

CREATE POLICY "Consultants can update their own profile"
ON public.consultant_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage consultant profiles"
ON public.consultant_profiles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Consultants can insert their own profile"
ON public.consultant_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add consultant_id to consultations table
ALTER TABLE public.consultations
ADD COLUMN IF NOT EXISTS consultant_id UUID;

-- Add trigger for updated_at
CREATE TRIGGER update_consultant_profiles_updated_at
BEFORE UPDATE ON public.consultant_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update has_role function to work with new role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
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