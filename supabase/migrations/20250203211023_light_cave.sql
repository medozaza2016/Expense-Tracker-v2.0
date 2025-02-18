/*
  # Create Global Settings Table
  
  1. New Tables
    - `global_settings`
      - `id` (text, primary key)
      - `company_name` (text)
      - `company_address` (text)
      - `company_phone` (text)
      - `company_email` (text)
      - `currency` (text)
      - `tax_rate` (numeric)
      - `date_format` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policy for authenticated users to read and manage settings
  
  3. Initial Data
    - Insert default settings record
*/

-- Create the global_settings table
CREATE TABLE global_settings (
  id text PRIMARY KEY,
  company_name text,
  company_address text,
  company_phone text,
  company_email text,
  currency text DEFAULT 'AED',
  tax_rate numeric(5,2) DEFAULT 0,
  date_format text DEFAULT 'YYYY-MM-DD',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read global settings"
  ON global_settings
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update global settings"
  ON global_settings
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Insert default settings
INSERT INTO global_settings (
  id,
  company_name,
  company_address,
  company_phone,
  company_email,
  currency,
  tax_rate,
  date_format
) VALUES (
  'global-settings',
  'Ahmed Mohamed Auto',
  'Dubai, UAE',
  '+971 50 123 4567',
  'info@ahmedmohamed.org',
  'AED',
  5.00,
  'YYYY-MM-DD'
) ON CONFLICT (id) DO NOTHING;
