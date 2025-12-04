-- Quick migration to add video support
-- Execute this SQL in your PostgreSQL database

-- 1. Create enum (if not exists)
DO $$ BEGIN
    CREATE TYPE news_content_type AS ENUM ('TEXT', 'VIDEO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add columns (if not exist)
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE news 
ADD COLUMN IF NOT EXISTS content_type news_content_type DEFAULT 'TEXT';

-- 3. Update existing records to have content_type = 'TEXT'
UPDATE news 
SET content_type = 'TEXT' 
WHERE content_type IS NULL;

-- 4. Create indexes (if not exist)
CREATE INDEX IF NOT EXISTS idx_news_content_type ON news(content_type);
CREATE INDEX IF NOT EXISTS idx_news_video_url ON news(video_url) WHERE video_url IS NOT NULL;

-- Done! Now you can use videos in the system.

