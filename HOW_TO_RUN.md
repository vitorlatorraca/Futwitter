# 🚀 How to Run the Project

## ⚠️ ERROR: "ERR_CONNECTION_REFUSED"

This means the server is NOT running! Follow these steps:

## 📋 Step by Step:

### 1. Check if .env file exists

Create a `.env` file in the project root with:

```env
DATABASE_URL=postgresql://user:password@host:port/database
PORT=5001
SESSION_SECRET=your-secret-key-here
```

### 2. Run Database Migration (IMPORTANT!)

**Option A - Direct SQL:**
```bash
# In terminal, run:
psql $DATABASE_URL -f migrations/add_video_support_to_news.sql
```

**Option B - Manually in database:**
Execute this SQL in your PostgreSQL database:

```sql
-- Create enum
DO $$ BEGIN
    CREATE TYPE news_content_type AS ENUM ('TEXT', 'VIDEO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add columns
ALTER TABLE news ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE news ADD COLUMN IF NOT EXISTS content_type news_content_type DEFAULT 'TEXT';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_news_content_type ON news(content_type);
CREATE INDEX IF NOT EXISTS idx_news_video_url ON news(video_url) WHERE video_url IS NOT NULL;
```

### 3. Install dependencies (if needed)

```bash
npm install
```

### 4. Run the server

**In PowerShell:**
```bash
npm run dev
```

**In CMD (Windows):**
```bash
npm run dev:win
```

### 5. Verify it's running

You should see in the terminal:
```
serving on port 5001
```

If you see an error, copy it and investigate!

## 🔍 Troubleshooting

### Error: "DATABASE_URL must be set"
- Check if the `.env` file exists
- Check if `DATABASE_URL` is filled in

### Error related to "news_content_type" or "content_type"
- Run the SQL migration above
- Or run: `npm run db:push`

### Error: "Port 5001 already in use"
- Close other processes using port 5001
- Or change the port in `.env`: `PORT=5002`

### Server doesn't start
- Check the terminal console for the specific error
- Make sure PostgreSQL is accessible
- Verify if `DATABASE_URL` is correct

## ✅ When it works:

Access: **http://localhost:5001**

You'll see the Futwitter homepage!

