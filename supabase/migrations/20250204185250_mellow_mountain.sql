-- Drop and recreate the format_audit_log_details function with vehicle info
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
  vehicle_info text;
BEGIN
  -- Start with the description
  result := log_row.description;
  
  -- For vehicle-related entities, get vehicle info
  IF log_row.entity_type IN ('VEHICLE', 'VEHICLE_EXPENSE', 'PROFIT_DISTRIBUTION') THEN
    IF log_row.entity_type = 'VEHICLE' THEN
      -- Get vehicle info from new_data for CREATE, or old_data for DELETE
      IF log_row.action_type = 'CREATE' THEN
        vehicle_info := format('%s %s %s (VIN: %s)',
          log_row.new_data->>'year',
          log_row.new_data->>'make',
          log_row.new_data->>'model',
          log_row.new_data->>'vin'
        );
      ELSE
        vehicle_info := format('%s %s %s (VIN: %s)',
          log_row.old_data->>'year',
          log_row.old_data->>'make',
          log_row.old_data->>'model',
          log_row.old_data->>'vin'
        );
      END IF;
      -- Replace entity_id with vehicle info
      result := regexp_replace(result, '#[a-f0-9-]+', vehicle_info);
    ELSE
      -- For expenses and distributions, get vehicle info from vehicles table
      SELECT format('%s %s %s (VIN: %s)',
        v.year,
        v.make,
        v.model,
        v.vin
      )
      FROM vehicles v
      WHERE v.id = log_row.entity_id::uuid
      INTO vehicle_info;
      
      IF vehicle_info IS NOT NULL THEN
        -- Replace entity_id with vehicle info
        result := regexp_replace(result, '#[a-f0-9-]+', vehicle_info);
      END IF;
    END IF;
  END IF;
  
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
