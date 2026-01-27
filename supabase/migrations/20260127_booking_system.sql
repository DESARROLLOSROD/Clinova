-- ============================================================================
-- MIGRATION: BOOKING SYSTEM
-- Date: 2026-01-27
-- Description: Adds clinic_services table and RLS policies for online booking.
-- ============================================================================

-- 1. Create clinic_services table
CREATE TABLE IF NOT EXISTS public.clinic_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Add Indexes
CREATE INDEX IF NOT EXISTS clinic_services_clinic_id_idx ON public.clinic_services(clinic_id);
CREATE INDEX IF NOT EXISTS clinic_services_is_active_idx ON public.clinic_services(is_active);

-- 3. Add Updated At Trigger
DROP TRIGGER IF EXISTS update_clinic_services_updated_at ON public.clinic_services;
CREATE TRIGGER update_clinic_services_updated_at
    BEFORE UPDATE ON public.clinic_services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable RLS
ALTER TABLE public.clinic_services ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Public Read Access (for Booking Page)
-- Allows anon users to see active services if the clinic allows online booking
CREATE POLICY "Public can view active services"
ON public.clinic_services FOR SELECT
USING (
    is_active = true 
    AND EXISTS (
        SELECT 1 FROM public.clinics c 
        WHERE c.id = clinic_services.clinic_id 
        AND c.allow_online_booking = true
    )
);

-- Clinic Managers/Admins Management Access
CREATE POLICY "Clinic admins can manage services"
ON public.clinic_services FOR ALL
USING (
    clinic_id = get_user_clinic_id() 
    AND current_user_role() IN ('super_admin', 'clinic_manager')
);

-- Super Admin Access
CREATE POLICY "Super admin can manage all services"
ON public.clinic_services FOR ALL
USING (is_super_admin());

-- 6. Insert Default Services for existing clinics (Optional/Example)
-- This assumes you want to populate it. We'll skip auto-population to avoid clutter, 
-- but users can add them via dashboard later.

-- 7. Update Appointments table to link to a service (Optional but good)
-- We add service_id to appointments to know what was booked
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'service_id') THEN
        ALTER TABLE public.appointments ADD COLUMN service_id UUID REFERENCES public.clinic_services(id) ON DELETE SET NULL;
    END IF;
END $$;
