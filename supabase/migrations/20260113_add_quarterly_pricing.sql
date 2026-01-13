-- ============================================================================
-- Add Quarterly Pricing to Subscription Plans
-- ============================================================================
-- This migration adds quarterly (3-month) pricing option to subscription plans
-- ============================================================================

-- Add quarterly_price column
ALTER TABLE public.subscription_plans
ADD COLUMN IF NOT EXISTS quarterly_price DECIMAL(10,2);

-- Update existing plans with quarterly pricing (approximate: monthly * 3 with small discount)
UPDATE public.subscription_plans
SET quarterly_price = CASE
  WHEN plan_name = 'basic' THEN 1397.00        -- ~499 * 3 with 7% discount
  WHEN plan_name = 'professional' THEN 2797.00 -- ~999 * 3 with 7% discount
  WHEN plan_name = 'enterprise' THEN 6997.00   -- ~2499 * 3 with 6% discount
  ELSE monthly_price * 2.85
END
WHERE quarterly_price IS NULL;

-- Add comment
COMMENT ON COLUMN public.subscription_plans.quarterly_price IS 'Quarterly (3-month) subscription price';
