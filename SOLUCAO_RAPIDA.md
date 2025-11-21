# ✅ SOLUÇÃO RÁPIDA - Erro "column video_url does not exist"

## 🔧 O que fazer AGORA:

### Opção 1: Executar Migration SQL (RECOMENDADO)

Execute este SQL no seu banco PostgreSQL:

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

**Como executar:**
- No Neon Console: Cole o SQL acima e execute
- Via psql: `psql $DATABASE_URL -f executar-migration.sql`
- Ou copie o conteúdo de `executar-migration.sql`

### Opção 2: Usar Drizzle (Alternativa)

```bash
npm run db:push
```

## ✅ Depois de executar:

1. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

2. **Acesse:** http://localhost:5001

## 📝 Nota:

O código agora está preparado para funcionar **mesmo sem** as colunas novas (usa fallbacks), mas para usar vídeos você precisa executar a migration acima.

---

## 🎨 Sobre os ajustes de layout:

Você mencionou que quer fazer ajustes no layout. Quando o site estiver funcionando, me diga quais ajustes você quer fazer e eu implemento! 

Pode ser:
- Mudanças de cores
- Espaçamentos
- Tamanhos de fonte
- Posicionamento de elementos
- Ou me envie o design do Figma que você mencionou!







