-- Insert default global settings if they don't exist
INSERT INTO global_settings (
  id,
  company_name,
  company_address,
  company_phone,
  company_email,
  currency,
  exchange_rate,
  date_format,
  created_at,
  updated_at
) VALUES (
  'global-settings',
  'Challenger Used Cars',
  'Showroom No 801/290, Opposite Tamouh Souq Al Haraj - Al Ruqa Al Hamra, Sharjah, United Arab Emirates',
  '+971 50 123 4567',
  'info@challengerucars.com',
  'AED',
  3.6725,
  'YYYY-MM-DD',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  company_address = EXCLUDED.company_address,
  company_phone = EXCLUDED.company_phone,
  company_email = EXCLUDED.company_email,
  currency = EXCLUDED.currency,
  exchange_rate = EXCLUDED.exchange_rate,
  date_format = EXCLUDED.date_format,
  updated_at = now();

-- Ensure RLS policies exist
DROP POLICY IF EXISTS "Authenticated users can read global settings" ON global_settings;
DROP POLICY IF EXISTS "Authenticated users can update global settings" ON global_settings;

CREATE POLICY "Anyone can read global settings"
  ON global_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update global settings"
  ON global_settings
  FOR UPDATE
  USING (auth.role() = 'authenticated');
