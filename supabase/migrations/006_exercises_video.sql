-- Add video_url column to exercises
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS video_url TEXT;
