-- Migration rápida para adicionar suporte a vídeos
-- Execute este SQL no seu banco PostgreSQL

-- 1. Criar enum (se não existir)
DO $$ BEGIN
    CREATE TYPE news_content_type AS ENUM ('TEXT', 'VIDEO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Adicionar colunas (se não existirem)
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE news 
ADD COLUMN IF NOT EXISTS content_type news_content_type DEFAULT 'TEXT';

-- 3. Atualizar registros existentes para terem content_type = 'TEXT'
UPDATE news 
SET content_type = 'TEXT' 
WHERE content_type IS NULL;

-- 4. Criar índices (se não existirem)
CREATE INDEX IF NOT EXISTS idx_news_content_type ON news(content_type);
CREATE INDEX IF NOT EXISTS idx_news_video_url ON news(video_url) WHERE video_url IS NOT NULL;

-- Pronto! Agora você pode usar vídeos no sistema.




