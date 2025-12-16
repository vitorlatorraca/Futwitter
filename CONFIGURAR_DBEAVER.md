# 🔌 Como Conectar seu Banco no DBeaver

## 📝 Passo 1: Ver sua DATABASE_URL

Abra o arquivo `.env` na raiz do projeto e encontre a linha:
```
DATABASE_URL=postgresql://...
```

## 📋 Passo 2: Extrair Informações Manualmente

Sua URL tem o formato:
```
postgresql://USUARIO:SENHA@HOST:PORTA/BANCO?sslmode=require
```

**Exemplo real:**
```
postgresql://neondb_owner:npg_CBvQmyPU60Yqep-fancy@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Como extrair:**
1. **Usuário:** Tudo entre `postgresql://` e o primeiro `:`
   - Exemplo: `neondb_owner`

2. **Senha:** Tudo entre o primeiro `:` e o `@`
   - Exemplo: `npg_CBvQmyPU60Yqep-fancy`
   - ⚠️ **IMPORTANTE:** Copie a senha COMPLETA, incluindo caracteres especiais

3. **Host:** Tudo entre o `@` e o próximo `:` ou `/`
   - Exemplo: `ep-cool-darkness-123456.us-east-2.aws.neon.tech`

4. **Porta:** Número após o `:` do host (se não tiver, use `5432`)
   - Exemplo: `5432` (padrão)

5. **Database:** Tudo entre o `/` e o `?` (ou fim da string)
   - Exemplo: `neondb`

## 🔧 Passo 3: Configurar no DBeaver

### 1. Abra o DBeaver

### 2. Clique em "Nova Conexão"
- Ícone de plug na barra superior
- OU: **Database > New Database Connection**

### 3. Selecione PostgreSQL
- Procure por **"PostgreSQL"** na lista
- Clique em **"Next"**

### 4. Preencha os Campos (Aba "Main")

Use as informações que você extraiu:

| Campo | Valor |
|-------|-------|
| **Host** | (seu host, ex: `ep-cool-darkness-123456.us-east-2.aws.neon.tech`) |
| **Port** | `5432` (ou a porta da sua URL) |
| **Database** | (seu database, ex: `neondb`) |
| **Username** | (seu usuário, ex: `neondb_owner`) |
| **Password** | (sua senha COMPLETA do .env) |

### 5. Configure SSL (Aba "SSL")

**Se você usa Neon ou outro serviço na nuvem:**
- ✅ Marque **"Use SSL"**
- Selecione **SSL Mode:** `Require`

**Se você usa PostgreSQL local:**
- Deixe desmarcado ou marque **"Prefer"**

### 6. Teste a Conexão
- Clique em **"Test Connection"** (botão na parte inferior)
- Se aparecer ✅ **"Connected"**, está tudo certo!
- Se der erro, veja a seção de problemas abaixo

### 7. Finalize
- Clique em **"Finish"**
- Sua conexão aparecerá na lista à esquerda

## 🐛 Problemas Comuns

### ❌ "Connection refused"
- Verifique se o host está correto
- Se for local, verifique se o PostgreSQL está rodando

### ❌ "Authentication failed"
- Verifique se copiou a senha COMPLETA (incluindo caracteres especiais)
- Verifique se o usuário está correto

### ❌ "SSL required" ou erro de SSL
- Marque "Use SSL" na aba SSL
- Selecione "Require" como SSL Mode

### ❌ Não vejo as tabelas
- Execute `npm run db:push` no terminal para criar as tabelas
- Verifique se está conectado ao banco correto

## 💡 Dica Rápida

Se você tem dificuldade em extrair manualmente, você pode:

1. Copiar a DATABASE_URL completa do `.env`
2. Colar em um editor de texto
3. Usar a busca para encontrar cada parte:
   - Procure por `@` para separar credenciais do host
   - Procure por `:` para separar usuário da senha
   - Procure por `/` para separar host do database

## ✅ Pronto!

Depois de conectar, você verá todas as tabelas do seu projeto:
- `users`
- `teams`
- `players`
- `matches`
- `news`
- E outras...

---

**Precisa ver o banco via terminal?** Execute: `npm run db:view`




