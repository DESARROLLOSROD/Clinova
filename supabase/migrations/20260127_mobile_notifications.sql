-- ============================================================================
-- MIGRATION: MOBILE NOTIFICATIONS
-- Date: 2026-01-27
-- Description: Adds user_devices table to store FCM tokens for push notifications.
-- ============================================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.user_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    fcm_token TEXT NOT NULL,
    platform TEXT CHECK (platform IN ('android', 'ios', 'web')),
    last_active TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, fcm_token) -- Prevent duplicate tokens for same user
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS user_devices_user_id_idx ON public.user_devices(user_id);
CREATE INDEX IF NOT EXISTS user_devices_fcm_token_idx ON public.user_devices(fcm_token);

-- 3. RLS
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

-- 4. Policies

-- Users can insert/view/update/delete THEIR OWN devices
DROP POLICY IF EXISTS "Users can manage their own devices" ON public.user_devices;
CREATE POLICY "Users can manage their own devices"
ON public.user_devices FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Super admins can view all devices (for debugging or broadcasting)
DROP POLICY IF EXISTS "Super admins can view all devices" ON public.user_devices;
CREATE POLICY "Super admins can view all devices"
ON public.user_devices FOR SELECT
USING (is_super_admin());
