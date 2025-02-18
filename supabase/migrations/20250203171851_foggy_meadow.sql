/*
  # Set admin role for specific user

  1. Changes
    - Updates the role to 'admin' for a specific user by email
*/

UPDATE profiles 
SET role = 'admin'
WHERE email = 'admin@example.com'
AND role = 'user';
