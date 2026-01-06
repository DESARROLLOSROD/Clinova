-- Create notifications table for tracking sent notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES public.therapists(id) ON DELETE CASCADE NOT NULL,
  recipient_email TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- 'appointment_assigned', 'session_assigned', 'appointment_updated', 'appointment_cancelled'
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  session_id UUID,
  sent_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX idx_notifications_sent_at ON public.notifications(sent_at);
CREATE INDEX idx_notifications_type ON public.notifications(notification_type);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Therapists can view their own notifications" ON public.notifications
  FOR SELECT USING (
    recipient_id IN (
      SELECT id FROM public.therapists WHERE email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Authenticated users can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create function to automatically send notification when therapist is assigned to appointment
CREATE OR REPLACE FUNCTION notify_therapist_assignment()
RETURNS TRIGGER AS $$
DECLARE
  v_therapist_email TEXT;
  v_therapist_id UUID;
  v_therapist_name TEXT;
  v_patient_name TEXT;
  v_appointment_time TEXT;
BEGIN
  -- Only proceed if therapist_id is set and changed
  IF NEW.therapist_id IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.therapist_id IS DISTINCT FROM NEW.therapist_id) THEN

    -- Get therapist details
    SELECT t.email, t.id, t.first_name || ' ' || t.last_name
    INTO v_therapist_email, v_therapist_id, v_therapist_name
    FROM public.therapists t
    WHERE t.id = NEW.therapist_id;

    -- Get patient name
    SELECT first_name || ' ' || last_name
    INTO v_patient_name
    FROM public.patients
    WHERE id = NEW.patient_id;

    -- Format appointment time
    v_appointment_time := TO_CHAR(NEW.start_time, 'DD/MM/YYYY HH24:MI');

    -- Insert notification
    INSERT INTO public.notifications (
      recipient_id,
      recipient_email,
      notification_type,
      subject,
      body,
      appointment_id
    ) VALUES (
      v_therapist_id,
      v_therapist_email,
      CASE WHEN TG_OP = 'INSERT' THEN 'appointment_assigned' ELSE 'appointment_updated' END,
      'Nueva cita asignada - ' || v_patient_name,
      'Hola ' || v_therapist_name || ',

Se te ha asignado una nueva cita:

Paciente: ' || v_patient_name || '
Fecha y hora: ' || v_appointment_time || '
' || COALESCE('Notas: ' || NEW.notes, '') || '

Por favor, revisa los detalles en el sistema.

Saludos,
Clinova',
      NEW.id
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for appointment assignments
DROP TRIGGER IF EXISTS trigger_notify_therapist_assignment ON public.appointments;
CREATE TRIGGER trigger_notify_therapist_assignment
  AFTER INSERT OR UPDATE OF therapist_id ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_therapist_assignment();

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifications
  SET read_at = timezone('utc'::text, now())
  WHERE id = notification_id
    AND recipient_id IN (
      SELECT id FROM public.therapists WHERE email = auth.jwt()->>'email'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
