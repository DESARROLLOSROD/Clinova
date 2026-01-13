-- ============================================================================
-- Subscription Plans Configuration
-- ============================================================================
-- This migration creates a table to manage subscription plans and their limits
-- ============================================================================

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Plan identification
  plan_name TEXT NOT NULL UNIQUE CHECK (plan_name IN ('basic', 'professional', 'enterprise')),
  display_name TEXT NOT NULL,
  description TEXT,

  -- Pricing
  monthly_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  yearly_price DECIMAL(10,2),
  currency TEXT DEFAULT 'MXN',

  -- Limits
  max_users INTEGER NOT NULL DEFAULT 2,
  max_patients INTEGER NOT NULL DEFAULT 100,
  max_therapists INTEGER,
  max_storage_gb INTEGER DEFAULT 5,

  -- Features (JSON)
  features JSONB DEFAULT '[]'::jsonb,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true, -- Show in pricing page

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default plans
INSERT INTO public.subscription_plans (plan_name, display_name, description, monthly_price, yearly_price, max_users, max_patients, max_therapists, max_storage_gb, features) VALUES
('basic', 'Básico', 'Perfecto para clínicas pequeñas que están comenzando', 499.00, 4990.00, 2, 50, 1, 5,
  '[
    "2 usuarios simultáneos",
    "Hasta 50 pacientes",
    "1 terapeuta",
    "5 GB de almacenamiento",
    "Agenda básica",
    "Notas SOAP",
    "Soporte por email"
  ]'::jsonb
),
('professional', 'Profesional', 'Para clínicas en crecimiento con múltiples profesionales', 999.00, 9990.00, 10, 500, 5, 50,
  '[
    "10 usuarios simultáneos",
    "Hasta 500 pacientes",
    "5 terapeutas",
    "50 GB de almacenamiento",
    "Agenda avanzada",
    "Notas SOAP completas",
    "Plantillas de ejercicios",
    "Reportes básicos",
    "Soporte prioritario"
  ]'::jsonb
),
('enterprise', 'Enterprise', 'Para grandes clínicas con necesidades avanzadas', 2499.00, 24990.00, 999, 999999, 999, 500,
  '[
    "Usuarios ilimitados",
    "Pacientes ilimitados",
    "Terapeutas ilimitados",
    "500 GB de almacenamiento",
    "Agenda personalizable",
    "Notas SOAP completas",
    "Plantillas ilimitadas",
    "Reportes avanzados",
    "API access",
    "Branding personalizado",
    "Soporte 24/7",
    "Gerente de cuenta dedicado"
  ]'::jsonb
)
ON CONFLICT (plan_name) DO NOTHING;

-- Create indexes
CREATE INDEX subscription_plans_plan_name_idx ON public.subscription_plans(plan_name);
CREATE INDEX subscription_plans_is_active_idx ON public.subscription_plans(is_active);

-- Add trigger for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Everyone can view active plans
CREATE POLICY "Anyone can view active plans"
ON public.subscription_plans FOR SELECT
USING (is_active = true AND is_visible = true);

-- Only super admins can modify plans
CREATE POLICY "Only super admins can update plans"
ON public.subscription_plans FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  )
);

CREATE POLICY "Only super admins can insert plans"
ON public.subscription_plans FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  )
);

-- Comments
COMMENT ON TABLE public.subscription_plans IS 'Configuration for subscription plans and their limits';
COMMENT ON COLUMN public.subscription_plans.plan_name IS 'Internal plan identifier: basic, professional, enterprise';
COMMENT ON COLUMN public.subscription_plans.features IS 'JSON array of feature descriptions';
COMMENT ON COLUMN public.subscription_plans.max_users IS 'Maximum number of concurrent users';
COMMENT ON COLUMN public.subscription_plans.max_patients IS 'Maximum number of patients';
