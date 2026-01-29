export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read_at: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
}
