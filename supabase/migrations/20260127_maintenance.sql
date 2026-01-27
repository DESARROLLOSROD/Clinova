-- Function to clean up old audit logs (retention: 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM audit_logs
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- If pg_cron is enabled in Supabase, you can schedule it like this:
-- SELECT cron.schedule('0 0 * * *', $$SELECT cleanup_old_audit_logs()$$);
-- (Runs every day at midnight)
