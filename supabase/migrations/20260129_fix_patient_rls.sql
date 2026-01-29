-- Fix specific RLS issues for patients and notifications

-- 1. Ensure patients can view their own profile/record explicitly
DROP POLICY IF EXISTS "Patients can view own profile" ON public.patients;
CREATE POLICY "Patients can view own profile"
ON public.patients FOR SELECT
USING (auth_user_id = auth.uid());

-- 2. Ensure patients can view their own appointments
DROP POLICY IF EXISTS "Patients can view own appointments" ON public.appointments;
CREATE POLICY "Patients can view own appointments"
ON public.appointments FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM public.patients WHERE auth_user_id = auth.uid()
  )
);

-- 3. Ensure notifications allow user self-access
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- 4. Enable Realtime for notifications (Safe idempotent block)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and schemaname = 'public' 
    and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
