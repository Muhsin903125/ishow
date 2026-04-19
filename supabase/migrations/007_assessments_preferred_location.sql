-- Add plain-text location field alongside the FK reference
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS preferred_location TEXT;
