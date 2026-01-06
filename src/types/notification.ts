export interface Notification {
  id: string;
  recipient_id: string;
  recipient_email: string;
  notification_type: 'appointment_assigned' | 'session_assigned' | 'appointment_updated' | 'appointment_cancelled';
  subject: string;
  body: string;
  appointment_id?: string;
  session_id?: string;
  sent_at: string;
  read_at?: string;
  created_at: string;
}

export interface NotificationWithDetails extends Notification {
  appointment?: {
    id: string;
    start_time: string;
    end_time: string;
    patient: {
      first_name: string;
      last_name: string;
    };
  };
}
