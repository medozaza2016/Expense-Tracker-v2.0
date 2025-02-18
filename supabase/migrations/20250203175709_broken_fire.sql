/*
  # Update profile creation trigger

  1. Changes
    - Update handle_new_user function to include first_name and last_name from auth.users metadata
    - Ensure is_active is set to true by default
  
  2. Security
    - No changes to RLS policies
    - Function remains security definer for proper access
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    role,
    first_name,
    last_name,
    is_active
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    NULLIF(new.raw_user_meta_data->>'first_name', ''),
    NULLIF(new.raw_user_meta_data->>'last_name', ''),
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
