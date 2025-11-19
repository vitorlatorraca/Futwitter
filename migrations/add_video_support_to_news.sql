-- Migration: Add video support to news table
-- This migration adds support for video content type (TikTok-style) to news articles

-- Step 1: Create the content_type enum
DO $$ BEGIN
    CREATE TYPE news_content_type AS ENUM ('TEXT', 'VIDEO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add video_url column (nullable, for video content)
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Step 3: Add content_type column with default 'TEXT'
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS content_type news_content_type NOT NULL DEFAULT 'TEXT';

-- Step 4: Update existing news to have TEXT content type (should already be default, but ensuring)
UPDATE news 
SET content_type = 'TEXT' 
WHERE content_type IS NULL;

-- Step 5: Add index for content_type for better query performance
CREATE INDEX IF NOT EXISTS idx_news_content_type ON news(content_type);

-- Step 6: Add index for video_url (for queries filtering by video content)
CREATE INDEX IF NOT EXISTS idx_news_video_url ON news(video_url) WHERE video_url IS NOT NULL;




