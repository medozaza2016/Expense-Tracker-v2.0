-- Delete the nada@ahmedmohamed.org account and related data
DO $$ 
DECLARE
  nada_id uuid;
BEGIN
  -- Get nada's user ID
  SELECT id INTO nada_id
  FROM auth.users
  WHERE email = 'nada@ahmedmohamed.org';

  -- If nada's account exists, delete all related data
  IF nada_id IS NOT NULL THEN
    -- Delete profile
    DELETE FROM profiles WHERE id = nada_id;
    
    -- Delete from auth.users
    DELETE FROM auth.users WHERE id = nada_id;
  END IF;
END $$;
