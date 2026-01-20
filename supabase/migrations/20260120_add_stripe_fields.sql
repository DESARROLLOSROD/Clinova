-- Add Stripe-related fields to clinics table
ALTER TABLE public.clinics
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_clinics_stripe_customer_id
ON public.clinics(stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clinics_stripe_subscription_id
ON public.clinics(stripe_subscription_id)
WHERE stripe_subscription_id IS NOT NULL;

-- Comments
COMMENT ON COLUMN public.clinics.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN public.clinics.stripe_subscription_id IS 'Active Stripe subscription ID';
