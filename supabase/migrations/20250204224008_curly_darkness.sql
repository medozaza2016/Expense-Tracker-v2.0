-- Drop the view that depends on the function first
DROP VIEW IF EXISTS formatted_audit_logs CASCADE;

-- Drop existing function
DROP FUNCTION IF EXISTS format_audit_log_details(audit_logs);

-- Create updated function with better vehicle info handling
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
  vehicle_id text;
BEGIN
  -- Start with the description
  result := log_row.description;
  
  -- For vehicle-related entities, get vehicle info
  IF log_row.entity_type IN ('VEHICLE', 'VEHICLE_EXPENSE', 'PROFIT_DISTRIBUTION') THEN
    -- Extract vehicle ID based on entity type
    vehicle_id := CASE
      WHEN log_row.entity_type = 'VEHICLE' THEN log_row.entity_id
      WHEN log_row.entity_type IN ('VEHICLE_EXPENSE', 'PROFIT_DISTRIBUTION') THEN
        CASE
          WHEN log_row.new_data IS NOT NULL THEN log_row.new_data->>'vehicle_id'
          ELSE log_row.old_data->>'vehicle_id'
        END
    END;

    -- Get vehicle info if we have an ID
    IF vehicle_id IS NOT NULL THEN
      SELECT format('%s %s %s (VIN: %s)',
        v.year,
        v.make,
        v.model,
        v.vin
      )
      FROM vehicles v
      WHERE v.id = vehicle_id::uuid
      INTO vehicle_info;
      
      IF vehicle_info IS NOT NULL THEN
        -- Replace vehicle ID with vehicle info
        result := regexp_replace(
          result,
          'vehicle (?:ID: )?[a-f0-9-]+',
          'vehicle ' || vehicle_info,
          'gi'
        );
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
      -- Skip certain fields we don't want to show
      IF key_name NOT IN ('updated_at', 'created_at', 'id') THEN
        -- Get old and new values
        old_val := log_row.old_data->key_name#>>'{}'::text[];
        new_val := log_row.new_data->key_name#>>'{}'::text[];
        
        -- If values are different, add to changes array
        IF old_val IS DISTINCT FROM new_val THEN
          -- Format timestamps nicely
          IF key_name LIKE '%_at' OR key_name LIKE '%_date' THEN
            old_val := to_char(old_val::timestamp with time zone, 'Mon DD, YYYY HH:MI AM');
            new_val := to_char(new_val::timestamp with time zone, 'Mon DD, YYYY HH:MI AM');
          END IF;

          changes := array_append(
            changes, 
            format('%s: %s → %s', 
              key_name,
              COALESCE(old_val, 'null'),
              COALESCE(new_val, 'null')
            )
          );
        END IF;
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

-- Recreate the view that depends on the function
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
