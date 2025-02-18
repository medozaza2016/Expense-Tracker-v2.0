/*
  # Add name field to profiles table

  1. Changes
    - Add `first_name` and `last_name` columns to profiles table
    - Add function to get full name
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN first_name text,
    ADD COLUMN last_name text;
  END IF;
END $$;

-- Function to get full name
CREATE OR REPLACE FUNCTION get_full_name(p profiles)
RETURNS text AS $$
BEGIN
  IF p.first_name IS NOT NULL AND p.last_name IS NOT NULL THEN
    RETURN p.first_name || ' ' || p.last_name;
  ELSIF p.first_name IS NOT NULL THEN
    RETURN p.first_name;
  ELSE
    RETURN split_part(p.email, '@', 1);
  END IF;
END;
$$ LANGUAGE plpgsql;
