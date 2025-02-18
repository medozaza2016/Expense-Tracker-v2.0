/*
  # Add is_active column to profiles table

  1. Changes
    - Add `is_active` boolean column to profiles table with default value true
    - Update existing rows to have is_active = true
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN is_active boolean NOT NULL DEFAULT true;
  END IF;
END $$;
