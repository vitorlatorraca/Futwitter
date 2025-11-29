# 🎥 Video Feature Setup

## ⚠️ IMPORTANT: Before running

The video feature adds new fields to the database. You need to run the migration first!

## 📋 Steps to run:

### 1. Run the Database Migration

Execute the migration SQL in your PostgreSQL database:

```bash
# Option 1: Via psql (recommended)
psql $DATABASE_URL -f migrations/add_video_support_to_news.sql

# Option 2: Via Drizzle Kit (if you prefer)
npm run db:push
```

**OR** run manually in your database:

```sql
-- Create the enum
DO $$ BEGIN
    CREATE TYPE news_content_type AS ENUM ('TEXT', 'VIDEO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add columns
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE news 
ADD COLUMN IF NOT EXISTS content_type news_content_type DEFAULT 'TEXT';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_news_content_type ON news(content_type);
CREATE INDEX IF NOT EXISTS idx_news_video_url ON news(video_url) WHERE video_url IS NOT NULL;
```

### 2. Run the Project

```bash
npm run dev
```

The site will be available at: **http://localhost:5001**

## ✅ What was implemented:

- ✅ Updated schema with `videoUrl` and `contentType` fields
- ✅ Creation form with video option
- ✅ TikTok-style VideoNewsCard component
- ✅ Filters by content type (Text/Video)
- ✅ Responsive full-width layout
- ✅ Minimalist design

## 🔧 If the site doesn't open:

1. **Check if the migration was executed** - The new fields need to exist in the database
2. **Check the console** - There may be database connection errors
3. **Check the .env** - DATABASE_URL needs to be configured
4. **Clear the cache** - Try `npm run build` and then `npm run dev`

## 📝 Notes:

- The fields are optional, so old news will continue working
- News without `contentType` will be treated as "TEXT" automatically
- Videos need a direct URL to the file (MP4 recommended, 9:16 format)
