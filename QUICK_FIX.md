# ✅ QUICK FIX - Error "column video_url does not exist"

## 🔧 What to do NOW:

### Option 1: Run Migration SQL (RECOMMENDED)

Execute this SQL in your PostgreSQL database:

```sql
DO $$ BEGIN
    CREATE TYPE news_content_type AS ENUM ('TEXT', 'VIDEO');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

ALTER TABLE news ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE news ADD COLUMN IF NOT EXISTS content_type news_content_type DEFAULT 'TEXT';

UPDATE news SET content_type = 'TEXT' WHERE content_type IS NULL;

CREATE INDEX IF NOT EXISTS idx_news_content_type ON news(content_type);
CREATE INDEX IF NOT EXISTS idx_news_video_url ON news(video_url) WHERE video_url IS NOT NULL;
```

**How to execute:**
- In Neon Console: Paste the SQL above and execute
- Via psql: `psql $DATABASE_URL -f run-migration.sql`
- Or copy the contents from `run-migration.sql`

### Option 2: Use Drizzle (Alternative)

```bash
npm run db:push
```

## ✅ After executing:

1. **Restart the server:**
   ```bash
   npm run dev
   ```

2. **Access:** http://localhost:5001

## 📝 Note:

The code is now prepared to work **even without** the new columns (uses fallbacks), but to use videos you need to run the migration above.

