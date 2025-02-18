-- Drop existing functions
DROP FUNCTION IF EXISTS create_backup(text);
DROP FUNCTION IF EXISTS restore_backup(json);

-- Create function to create a backup
CREATE OR REPLACE FUNCTION create_backup(p_type text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_backup_id uuid;
  v_tables text[];
  v_query text;
  v_data jsonb;
  v_result jsonb;
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
    -- Get table data
    v_query := format('SELECT coalesce(jsonb_agg(t), ''[]''::jsonb) FROM %I t', v_tables[i]);
    EXECUTE v_query INTO v_data;
    
    -- Add table data to result
    v_result := jsonb_set(
      v_result,
      array['tables', v_tables[i]],
      v_data
    );
  END LOOP;

  -- Update backup log with success
  UPDATE backup_logs
  SET status = 'completed',
      completed_at = now(),
      file_size = octet_length(v_result::text)
  WHERE id = v_backup_id;

  RETURN v_result;
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
CREATE OR REPLACE FUNCTION restore_backup(p_backup_data jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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
      
      -- Delete existing data
      EXECUTE format('DELETE FROM %I', v_table);
      
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
