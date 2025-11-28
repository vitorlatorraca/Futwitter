# 🚀 Guia de Deploy

Este guia explica como colocar o **Brasileirão DataFlow** no ar usando **Render** ou **Railway**.

## Pré-requisitos

1.  Uma conta no [GitHub](https://github.com/).
2.  O código do projeto salvo em um repositório no GitHub.

---

## Opção 1: Deploy no Render (Recomendado)

O Render é muito fácil de usar e tem um plano gratuito.

1.  Crie uma conta no [Render.com](https://render.com/).
2.  No painel, clique em **New +** e selecione **Web Service**.
3.  Conecte sua conta do GitHub e selecione o repositório do projeto.
4.  Dê um nome para o serviço (ex: `brasileirao-dataflow`).
5.  **Configurações de Build e Start:**
    *   **Runtime:** Node
    *   **Build Command:** `npm install && npm run build`
    *   **Start Command:** `npm run start:prod`
6.  **Variáveis de Ambiente (Environment Variables):**
    Role para baixo até a seção "Environment Variables" e adicione:
    *   `DATABASE_URL`: A URL do seu banco de dados PostgreSQL (veja abaixo como criar um).
    *   `SESSION_SECRET`: Uma senha longa e aleatória (ex: digite qualquer coisa segura).
    *   `NODE_ENV`: `production`
7.  Clique em **Create Web Service**.

### Como criar um Banco de Dados no Render

1.  No painel do Render, clique em **New +** e selecione **PostgreSQL**.
2.  Dê um nome (ex: `brasileirao-db`).
3.  Escolha o plano **Free**.
4.  Clique em **Create Database**.
5.  Quando estiver pronto, copie a **Internal Database URL** e use como o valor de `DATABASE_URL` no seu Web Service.

---

## Opção 2: Deploy no Railway

O Railway também é excelente e detecta configurações automaticamente.

1.  Crie uma conta no [Railway.app](https://railway.app/).
2.  Clique em **New Project** > **Deploy from GitHub repo**.
3.  Selecione o repositório do projeto.
4.  O Railway vai tentar identificar o projeto.
5.  Vá em **Variables** e adicione:
    *   `DATABASE_URL`: (O Railway pode criar um banco para você, veja abaixo).
    *   `SESSION_SECRET`: Uma senha segura.
6.  **Banco de Dados:**
    *   No painel do projeto, clique em **New** > **Database** > **Add PostgreSQL**.
    *   O Railway vai criar o banco e automaticamente adicionar a variável `DATABASE_URL` ao seu projeto.

---

## ⚠️ Importante: Migrations

Após o deploy, o banco de dados estará vazio. Você precisa criar as tabelas.

**No Render:**
1.  Vá na aba **Shell** do seu Web Service.
2.  Execute: `npm run db:push`

**No Railway:**
1.  Vá na aba do seu serviço > **Settings** > **Deploy** > **Build Command**.
2.  Altere para: `npm install && npm run build && npm run db:push` (Isso vai rodar as migrations a cada deploy).
    *   *Alternativa:* Use a CLI do Railway ou conecte-se ao banco localmente para rodar o SQL.

---

## Verificação

Acesse a URL gerada pelo Render ou Railway. O sistema deve estar funcionando!
