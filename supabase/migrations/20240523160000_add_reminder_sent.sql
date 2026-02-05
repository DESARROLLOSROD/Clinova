-- Add reminder_sent to appointments table
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS appointments_start_time_idx ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS appointments_reminder_sent_idx ON public.appointments(reminder_sent);

COMMENT ON COLUMN public.appointments.reminder_sent IS 'Flag to indicate if the 24h reminder email has been sent';
