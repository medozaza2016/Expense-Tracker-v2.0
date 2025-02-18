/*
  # Create backup and restore functions

  1. Changes
    - Create `backup_logs` table to track backup history
    - Create `create_backup` function to generate JSON backup
    - Create `restore_backup` function to restore from JSON backup
    - Add RLS policies for `backup_logs`
    - Add indexes for performance
    - Add cleanup function for old logs

  2. Security
    - Enable RLS on `backup_logs`
    - Authenticated users can read and create logs
    - Only the user who created a log can update it
*/

-- Create backup_logs table to track backup history
CREATE TABLE IF NOT EXISTS backup_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  file_name text NOT NULL,
  file_size bigint,
  backup_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read backup logs"
  ON backup_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create backup logs"
  ON backup_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their own backup logs"
  ON backup_logs
  FOR UPDATE
  USING (created_by = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_backup_logs_created_at ON backup_logs(created_at DESC);
CREATE INDEX idx_backup_logs_user_id ON backup_logs(created_by);
CREATE INDEX idx_backup_logs_status ON backup_logs(status);

-- Create function to create a backup
CREATE OR REPLACE FUNCTION create_backup(p_type text)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_backup_id uuid;
  v_tables text[];
  v_query text;
  v_data jsonb;
  v_result jsonb;
  v_error_message text; -- Variable to store error message
BEGIN
  -- Create backup log entry
  INSERT INTO backup_logs (created_by, file_name, backup_type, status)
  VALUES (auth.uid(), format('backup_%s_%s.json', p_type, to_char(now(), 'YYYYMMDD_HH24MISS')), p_type, 'in_progress')
  RETURNING id INTO v_backup_id;

  -- Get list of tables to backup
  v_tables := ARRAY['vehicles', 'vehicle_expenses', 'profit_distributions', 'transactions', 'categories', 'financial_settings', 'global_settings'];

  -- Initialize result
  v_result := jsonb_build_object(
    'backup_id', v_backup_id,
    'created_at', now(),
    'type', p_type,
    'tables', '{}'::jsonb
  );

  -- Backup each table
  FOR i IN 1..array_length(v_tables, 1) LOOP
    BEGIN -- Start a nested block to catch exceptions for each table
      -- Get table data
      v_query := format('SELECT coalesce(jsonb_agg(t), ''[]''::jsonb) FROM %I t', v_tables[i]);
      EXECUTE v_query INTO v_data;
      
      -- Add table data to result
      v_result := jsonb_set(
        v_result,
        array['tables', v_tables[i]],
        v_data
      );
    EXCEPTION WHEN OTHERS THEN
      -- Capture the error message
      v_error_message := SQLERRM;
      
      -- Update backup log with error for this specific table
      UPDATE backup_logs
      SET status = 'failed',
          completed_at = now(),
          error_message = 'Error backing up table ' || v_tables[i] || ': ' || v_error_message
      WHERE id = v_backup_id;
      
      -- Continue to the next table (don't re-raise the exception)
    END;
  END LOOP;

  -- Update backup log with success (if no errors occurred)
  UPDATE backup_logs
  SET status = 'completed',
      completed_at = now(),
      file_size = octet_length(v_result::text)
  WHERE id = v_backup_id;

  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  -- Update backup log with error (for errors outside the table loop)
  GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
  UPDATE backup_logs
  SET status = 'failed',
      completed_at = now(),
      error_message = 'General error: ' || v_error_message
  WHERE id = v_backup_id;
  
  RAISE; -- Re-raise the exception to be caught by the calling function
END;
$$;

-- Create function to restore from backup
CREATE OR REPLACE FUNCTION restore_backup(p_backup_data jsonb)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_table text;
  v_data jsonb;
BEGIN
  -- Start transaction
  BEGIN
    -- For each table in the backup
    FOR v_table IN 
      SELECT jsonb_object_keys(p_backup_data->'tables')
    LOOP
      -- Get table data
      v_data := p_backup_data->'tables'->v_table;
      
      -- Delete existing data with a WHERE clause
      EXECUTE format('DELETE FROM %I WHERE true', v_table);
      
      -- Insert backup data if there is any
      IF jsonb_array_length(v_data) > 0 THEN
        EXECUTE format(
          'INSERT INTO %I SELECT * FROM jsonb_populate_recordset(null::%I, $1)',
          v_table,
          v_table
        ) USING v_data;
      END IF;
    END LOOP;

    RETURN true;
  EXCEPTION WHEN OTHERS THEN
    RAISE;
  END;
END;
$$;

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
