-- Add payment status to appointments
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
ADD COLUMN IF NOT EXISTS stripe_session_id text;

CREATE INDEX IF NOT EXISTS idx_appointments_payment_status ON public.appointments(payment_status);
