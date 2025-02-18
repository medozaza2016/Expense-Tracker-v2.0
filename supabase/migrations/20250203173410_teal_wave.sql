ALTER TABLE financial_settings
ADD COLUMN IF NOT EXISTS additional numeric(10,2) DEFAULT 0;
