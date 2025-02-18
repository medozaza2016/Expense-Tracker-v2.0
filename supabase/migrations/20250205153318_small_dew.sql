-- Add auto_logout_minutes column to global_settings table
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS auto_logout_minutes integer NOT NULL DEFAULT 30;

-- Update existing settings with default value
UPDATE global_settings
SET auto_logout_minutes = 30
WHERE auto_logout_minutes IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN global_settings.auto_logout_minutes IS 'Number of minutes of inactivity before automatic logout (1-480)';

-- Add check constraint to ensure valid range
ALTER TABLE global_settings
ADD CONSTRAINT check_auto_logout_minutes 
CHECK (auto_logout_minutes BETWEEN 1 AND 480);
