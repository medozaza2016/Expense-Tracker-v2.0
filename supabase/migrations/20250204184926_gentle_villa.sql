-- Drop existing audit_logs table and its policies
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Create enhanced audit_logs table
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  action_type text NOT NULL CHECK (action_type IN (
    'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT',
    'BACKUP', 'RESTORE', 'EXPORT', 'IMPORT', 'AUTO_DISTRIBUTE'
  )),
  entity_type text NOT NULL CHECK (entity_type IN (
    'VEHICLE', 'VEHICLE_EXPENSE', 'PROFIT_DISTRIBUTION',
    'TRANSACTION', 'CATEGORY', 'USER', 'SETTINGS',
    'GLOBAL_SETTINGS', 'BACKUP', 'SYSTEM'
  )),
  entity_id text,
  old_data jsonb,
  new_data jsonb,
  description text NOT NULL,
  metadata jsonb,
  ip_address text,
  user_agent text
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read audit logs"
  ON audit_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert audit logs"
  ON audit_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);

-- Create view for audit log statistics
CREATE OR REPLACE VIEW audit_log_stats AS
SELECT 
  date_trunc('day', created_at) as day,
  action_type,
  entity_type,
  count(*) as action_count,
  count(DISTINCT user_id) as unique_users
FROM audit_logs
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 2, 3;

-- Create function to clean up old audit logs (keeps last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < now() - interval '90 days';
END;
$$;

-- Create trigger to automatically clean up old logs daily
CREATE OR REPLACE FUNCTION trigger_cleanup_old_audit_logs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM cleanup_old_audit_logs();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER cleanup_old_audit_logs_trigger
  AFTER INSERT ON audit_logs
  EXECUTE FUNCTION trigger_cleanup_old_audit_logs();

-- Create function to format audit log details
CREATE OR REPLACE FUNCTION format_audit_log_details(log_row audit_logs)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  result text;
  change_details text;
  key_name text;
  old_val text;
  new_val text;
  changes text[] := '{}';
BEGIN
  -- Start with the description
  result := log_row.description;
  
  -- Add change details for updates
  IF log_row.action_type = 'UPDATE' AND log_row.old_data IS NOT NULL AND log_row.new_data IS NOT NULL THEN
    -- Get all keys from both old and new data
    FOR key_name IN 
      SELECT DISTINCT k 
      FROM (
        SELECT jsonb_object_keys(log_row.old_data) AS k
        UNION 
        SELECT jsonb_object_keys(log_row.new_data)
      ) keys 
    LOOP
      -- Get old and new values
      old_val := log_row.old_data->key_name#>>'{}'::text[];
      new_val := log_row.new_data->key_name#>>'{}'::text[];
      
      -- If values are different, add to changes array
      IF old_val IS DISTINCT FROM new_val THEN
        changes := array_append(
          changes, 
          format('%s: %s → %s', 
            key_name,
            COALESCE(old_val, 'null'),
            COALESCE(new_val, 'null')
          )
        );
      END IF;
    END LOOP;
    
    -- If we have changes, add them to the result
    IF array_length(changes, 1) > 0 THEN
      result := result || ' Changes: ' || array_to_string(changes, ', ');
    END IF;
  END IF;
  
  -- Add metadata if present
  IF log_row.metadata IS NOT NULL AND log_row.metadata ? 'additional_info' THEN
    result := result || ' ' || log_row.metadata->>'additional_info';
  END IF;
  
  RETURN result;
END;
$$;

-- Create view for formatted audit logs
CREATE OR REPLACE VIEW formatted_audit_logs AS
SELECT 
  al.id,
  al.created_at,
  al.user_id,
  COALESCE(p.email, 'System') as user_email,
  al.action_type,
  al.entity_type,
  al.entity_id,
  format_audit_log_details(al.*) as formatted_details,
  al.ip_address,
  al.user_agent
FROM audit_logs al
LEFT JOIN auth.users p ON p.id = al.user_id
ORDER BY al.created_at DESC;

-- Add comment to explain the table
COMMENT ON TABLE audit_logs IS 'Stores detailed audit logs for all system actions';

-- Add comments for columns
COMMENT ON COLUMN audit_logs.action_type IS 'Type of action performed (CREATE, UPDATE, DELETE, etc.)';
COMMENT ON COLUMN audit_logs.entity_type IS 'Type of entity the action was performed on';
COMMENT ON COLUMN audit_logs.entity_id IS 'Identifier of the affected entity';
COMMENT ON COLUMN audit_logs.old_data IS 'Previous state of the entity for updates/deletes';
COMMENT ON COLUMN audit_logs.new_data IS 'New state of the entity for creates/updates';
COMMENT ON COLUMN audit_logs.description IS 'Human-readable description of the action';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional contextual information about the action';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the user performing the action';
COMMENT ON COLUMN audit_logs.user_agent IS 'User agent of the browser/client used';
