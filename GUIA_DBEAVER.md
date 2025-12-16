# 🔌 Guia: Conectar Banco de Dados no DBeaver

## 📋 Passo a Passo

### 1. Obter Informações de Conexão

Execute no terminal:
```bash
npm run db:connection
```

Isso vai mostrar as informações de conexão extraídas do seu `.env`.

### 2. Configurar no DBeaver

#### Passo 1: Abrir DBeaver
- Abra o DBeaver no seu computador

#### Passo 2: Criar Nova Conexão
- Clique no ícone **"Nova Conexão"** (plug) na barra superior
- OU vá em **Database > New Database Connection**

#### Passo 3: Selecionar PostgreSQL
- Na lista de bancos, selecione **"PostgreSQL"**
- Clique em **"Next"**

#### Passo 4: Configurar Conexão (Aba Main)

Preencha os campos com as informações do seu `.env`:

**Como extrair da DATABASE_URL:**

A URL geralmente tem o formato:
```
postgresql://usuario:senha@host:porta/banco?sslmode=require
```

**Exemplo para Neon:**
```
postgresql://neondb_owner:npg_ABC123@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Campos no DBeaver:**
- **Host:** `ep-cool-darkness-123456.us-east-2.aws.neon.tech`
- **Port:** `5432` (ou o número que aparecer na URL)
- **Database:** `neondb`
- **Username:** `neondb_owner`
- **Password:** `npg_ABC123` (a senha completa)

**Exemplo para PostgreSQL Local:**
```
postgresql://postgres:minhasenha@localhost:5432/brasileiraodataflow
```

**Campos no DBeaver:**
- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `brasileiraodataflow`
- **Username:** `postgres`
- **Password:** `minhasenha`

#### Passo 5: Configurar SSL (Aba SSL)

**Para Neon ou serviços na nuvem:**
- ✅ Marque **"Use SSL"**
- Selecione **SSL Mode:** `Require`

**Para PostgreSQL Local:**
- Deixe desmarcado ou marque **"Prefer"**

#### Passo 6: Testar Conexão
- Clique em **"Test Connection"** (botão na parte inferior)
- Se aparecer "Connected", está tudo certo!
- Se der erro, verifique:
  - Se a senha está correta
  - Se o banco está acessível
  - Se o SSL está configurado corretamente

#### Passo 7: Finalizar
- Clique em **"Finish"**
- A conexão aparecerá na lista de conexões do DBeaver

## 🔍 Dicas

### Se o script `npm run db:connection` não funcionar:

1. Abra o arquivo `.env` na raiz do projeto
2. Encontre a linha `DATABASE_URL=`
3. A URL tem o formato: `postgresql://usuario:senha@host:porta/banco`
4. Extraia manualmente cada parte

### Problemas Comuns

**Erro: "Connection refused"**
- Verifique se o banco está rodando (se for local)
- Verifique se o host está correto

**Erro: "Authentication failed"**
- Verifique se o usuário e senha estão corretos
- Para Neon, certifique-se de usar a senha completa da string de conexão

**Erro: "SSL required"**
- Marque "Use SSL" na aba SSL
- Selecione "Require" como SSL Mode

**Não consigo ver as tabelas**
- Certifique-se de que executou `npm run db:push` para criar as tabelas
- Verifique se está conectado ao banco correto

## 📝 Estrutura do Banco

Após conectar, você verá as seguintes tabelas principais:
- `users` - Usuários
- `teams` - Times
- `players` - Jogadores
- `matches` - Partidas
- `news` - Notícias
- `journalists` - Jornalistas
- `badges` - Badges
- `transfers` - Transferências
- `influencer_requests` - Solicitações de influencer
- E outras...

---

**Precisa de ajuda?** Execute `npm run db:view` para ver uma visão geral do banco via terminal.




