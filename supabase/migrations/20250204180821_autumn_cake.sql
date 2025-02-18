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

-- Create function to create a backup
CREATE OR REPLACE FUNCTION create_backup(p_type text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_backup_id uuid;
  v_tables text[];
  v_query text;
  v_result json;
BEGIN
  -- Create backup log entry
  INSERT INTO backup_logs (created_by, file_name, backup_type, status)
  VALUES (auth.uid(), format('backup_%s_%s.json', p_type, to_char(now(), 'YYYYMMDD_HH24MISS')), p_type, 'in_progress')
  RETURNING id INTO v_backup_id;

  -- Get list of tables to backup
  v_tables := ARRAY['vehicles', 'vehicle_expenses', 'profit_distributions', 'transactions', 'categories', 'financial_settings', 'global_settings'];

  -- Initialize result JSON
  v_result := json_build_object(
    'backup_id', v_backup_id,
    'created_at', now(),
    'type', p_type,
    'tables', json_build_object()
  );

  -- Backup each table
  FOR i IN 1..array_length(v_tables, 1) LOOP
    v_query := format('SELECT json_agg(t) FROM %I t', v_tables[i]);
    EXECUTE v_query INTO v_result;
    v_result := jsonb_set(
      v_result::jsonb,
      array['tables', v_tables[i]],
      coalesce(v_result::jsonb, '[]'::jsonb)
    );
  END LOOP;

  -- Update backup log with success
  UPDATE backup_logs
  SET status = 'completed',
      completed_at = now(),
      file_size = octet_length(v_result::text)
  WHERE id = v_backup_id;

  RETURN v_backup_id;
EXCEPTION WHEN OTHERS THEN
  -- Update backup log with error
  UPDATE backup_logs
  SET status = 'failed',
      completed_at = now(),
      error_message = SQLERRM
  WHERE id = v_backup_id;
  
  RAISE;
END;
$$;

-- Create function to restore from backup
CREATE OR REPLACE FUNCTION restore_backup(p_backup_data json)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_table text;
  v_data json;
BEGIN
  -- Start transaction
  BEGIN
    -- For each table in the backup
    FOR v_table, v_data IN SELECT * FROM json_each(p_backup_data->'tables')
    LOOP
      -- Delete existing data
      EXECUTE format('DELETE FROM %I', v_table);
      
      -- Insert backup data if there is any
      IF jsonb_array_length(v_data::jsonb) > 0 THEN
        EXECUTE format(
          'INSERT INTO %I SELECT * FROM json_populate_recordset(null::%I, $1)',
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
