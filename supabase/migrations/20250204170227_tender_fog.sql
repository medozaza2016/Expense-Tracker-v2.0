-- Add new columns to vehicles table
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS owner_name text,
ADD COLUMN IF NOT EXISTS tc_number text,
ADD COLUMN IF NOT EXISTS certificate_number text,
ADD COLUMN IF NOT EXISTS registration_location text;
