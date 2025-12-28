# 🚀 Como Rodar o Projeto

## ⚠️ PROBLEMA: "ERR_CONNECTION_REFUSED"

Isso significa que o servidor não está rodando. Siga estes passos:

## 📋 Passo a Passo:

### 1. Verificar se o .env existe

Crie um arquivo `.env` na raiz do projeto com:

```env
DATABASE_URL=postgresql://usuario:senha@host:porta/database
PORT=5001
SESSION_SECRET=sua-chave-secreta-aqui
```

### 2. Executar a Migration (IMPORTANTE!)

**Opção A - Via SQL direto:**
```bash
# No terminal, execute:
psql $DATABASE_URL -f migrations/add_video_support_to_news.sql
```

**Opção B - Manualmente no banco:**
Execute este SQL no seu banco PostgreSQL:

```sql
-- Criar enum
DO $$ BEGIN
    CREATE TYPE news_content_type AS ENUM ('TEXT', 'VIDEO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Adicionar colunas
ALTER TABLE news ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE news ADD COLUMN IF NOT EXISTS content_type news_content_type DEFAULT 'TEXT';

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_news_content_type ON news(content_type);
CREATE INDEX IF NOT EXISTS idx_news_video_url ON news(video_url) WHERE video_url IS NOT NULL;
```

### 3. Instalar dependências (se necessário)

```bash
npm install
```

### 4. Rodar o servidor

**No PowerShell:**
```bash
npm run dev
```

**No CMD (Windows):**
```bash
npm run dev:win
```

### 5. Verificar se está rodando

Você deve ver no terminal algo como:
```
serving on port 5001
```

Se aparecer algum erro, copie e me envie!

## 🔍 Troubleshooting

### Erro: "DATABASE_URL must be set"
- Verifique se o arquivo `.env` existe
- Verifique se `DATABASE_URL` está preenchido

### Erro relacionado a "news_content_type" ou "content_type"
- Execute a migration SQL acima
- Ou execute: `npm run db:push`

### Erro: "Port 5001 already in use"
- Feche outros processos usando a porta 5001
- Ou mude a porta no `.env`: `PORT=5002`

### Servidor não inicia
- Verifique o console do terminal para ver o erro específico
- Certifique-se de que o PostgreSQL está acessível
- Verifique se a `DATABASE_URL` está correta

## ✅ Quando funcionar:

Acesse: **http://localhost:5001**

Você verá a página inicial do Brasileirão DataFlow!








