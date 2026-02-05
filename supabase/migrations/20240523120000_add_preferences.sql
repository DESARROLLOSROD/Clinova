-- Add notification_preferences column to user_profiles if it doesn't exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": true}'::jsonb;

-- Comment on column
COMMENT ON COLUMN public.user_profiles.notification_preferences IS 'User preferences for notifications (email, push, types)';
