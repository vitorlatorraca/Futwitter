# 🎥 Setup da Funcionalidade de Vídeo

## ⚠️ IMPORTANTE: Antes de rodar

A funcionalidade de vídeo adiciona novos campos ao banco de dados. Você precisa executar a migration primeiro!

## 📋 Passos para rodar:

### 1. Executar a Migration do Banco de Dados

Execute o SQL de migration no seu banco de dados PostgreSQL:

```bash
# Opção 1: Via psql (recomendado)
psql $DATABASE_URL -f migrations/add_video_support_to_news.sql

# Opção 2: Via Drizzle Kit (se preferir)
npm run db:push
```

**OU** execute manualmente no seu banco:

```sql
-- Criar o enum
DO $$ BEGIN
    CREATE TYPE news_content_type AS ENUM ('TEXT', 'VIDEO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Adicionar colunas
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE news 
ADD COLUMN IF NOT EXISTS content_type news_content_type DEFAULT 'TEXT';

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_news_content_type ON news(content_type);
CREATE INDEX IF NOT EXISTS idx_news_video_url ON news(video_url) WHERE video_url IS NOT NULL;
```

### 2. Rodar o Projeto

```bash
npm run dev
```

O site estará disponível em: **http://localhost:5001**

## ✅ O que foi implementado:

- ✅ Schema atualizado com campos `videoUrl` e `contentType`
- ✅ Formulário de criação com opção de vídeo
- ✅ Componente VideoNewsCard tipo TikTok
- ✅ Filtros por tipo de conteúdo (Texto/Vídeo)
- ✅ Layout full-width responsivo
- ✅ Design minimalista

## 🔧 Se o site não abrir:

1. **Verifique se a migration foi executada** - Os campos novos precisam existir no banco
2. **Verifique o console** - Pode haver erros de conexão com o banco
3. **Verifique o .env** - DATABASE_URL precisa estar configurado
4. **Limpe o cache** - Tente `npm run build` e depois `npm run dev`

## 📝 Notas:

- Os campos são opcionais, então notícias antigas continuarão funcionando
- Notícias sem `contentType` serão tratadas como "TEXT" automaticamente
- Vídeos precisam de URL direta para o arquivo (MP4 recomendado, formato 9:16)








