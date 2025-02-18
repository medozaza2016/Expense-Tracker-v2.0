-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  details text NOT NULL
);

-- Enable RLS if not already enabled
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can read audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON audit_logs;

-- Create new policies
CREATE POLICY "Authenticated users can read audit logs"
  ON audit_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert audit logs"
  ON audit_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create index for better performance if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'audit_logs' 
    AND indexname = 'idx_audit_logs_created_at'
  ) THEN
    CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
  END IF;
END $$;
