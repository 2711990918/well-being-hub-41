-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
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

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create health_records table for personal health info
CREATE TABLE public.health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  blood_type TEXT,
  allergies TEXT[],
  medical_history TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own health records"
ON public.health_records FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all health records"
ON public.health_records FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create diet_plans table for health diet recommendations
CREATE TABLE public.diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  meal_type TEXT NOT NULL, -- breakfast, lunch, dinner, snack
  calories INTEGER,
  ingredients TEXT[],
  instructions TEXT,
  suitable_for TEXT[], -- health conditions
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active diet plans are viewable by everyone"
ON public.diet_plans FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage diet plans"
ON public.diet_plans FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create exercise_plans table for fitness plans
CREATE TABLE public.exercise_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL, -- beginner, intermediate, advanced
  duration_minutes INTEGER,
  calories_burn INTEGER,
  equipment TEXT[],
  steps TEXT[],
  video_url TEXT,
  image_url TEXT,
  category TEXT NOT NULL, -- cardio, strength, yoga, etc.
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exercise_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active exercise plans are viewable by everyone"
ON public.exercise_plans FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage exercise plans"
ON public.exercise_plans FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create health_monitoring table for health status tracking
CREATE TABLE public.health_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  blood_sugar DECIMAL(5,2),
  sleep_hours DECIMAL(4,2),
  water_intake INTEGER, -- ml
  steps INTEGER,
  mood TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.health_monitoring ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own monitoring data"
ON public.health_monitoring FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all monitoring data"
ON public.health_monitoring FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create chronic_diseases table for chronic disease management
CREATE TABLE public.chronic_diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  disease_name TEXT NOT NULL,
  diagnosis_date DATE,
  current_status TEXT,
  medications TEXT[],
  doctor_notes TEXT,
  next_checkup DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chronic_diseases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own chronic disease records"
ON public.chronic_diseases FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all chronic disease records"
ON public.chronic_diseases FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create wellness_courses table for activities and courses
CREATE TABLE public.wellness_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructor TEXT,
  category TEXT NOT NULL,
  duration_minutes INTEGER,
  price DECIMAL(10,2) DEFAULT 0,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wellness_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active courses are viewable by everyone"
ON public.wellness_courses FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage courses"
ON public.wellness_courses FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create products table for wellness products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active products are viewable by everyone"
ON public.products FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create orders table for purchases
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_type TEXT NOT NULL, -- product, course
  item_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, completed, cancelled
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders"
ON public.orders FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create consultations table for mental health consultations
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  consultant_name TEXT,
  topic TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own consultations"
ON public.consultations FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all consultations"
ON public.consultations FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create community_posts table for social interaction
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts are viewable by authenticated users"
ON public.community_posts FOR SELECT
TO authenticated
USING (is_published = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own posts"
ON public.community_posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.community_posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all posts"
ON public.community_posts FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create system_settings table
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are viewable by admins"
ON public.system_settings FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage settings"
ON public.system_settings FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON public.health_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diet_plans_updated_at
  BEFORE UPDATE ON public.diet_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercise_plans_updated_at
  BEFORE UPDATE ON public.exercise_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chronic_diseases_updated_at
  BEFORE UPDATE ON public.chronic_diseases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wellness_courses_updated_at
  BEFORE UPDATE ON public.wellness_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();