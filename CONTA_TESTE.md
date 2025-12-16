# 📝 Conta de Teste Criada

## ⚠️ IMPORTANTE

**A conta não foi criada ainda porque a DATABASE_URL está inválida.**

Você precisa:
1. Configurar a DATABASE_URL correta no arquivo `.env`
2. Executar `npm run create:account` novamente

---

## 📋 Dados da Conta que Será Criada

Quando você executar o script, uma conta será criada com os seguintes dados:

### Credenciais de Login

```
Email: teste[timestamp]@exemplo.com
Senha: senha123456
Nome: Usuario Teste
```

**Exemplo de email gerado:**
- `teste1765085284591@exemplo.com` (o número muda a cada execução)

### Informações da Conta

- **Tipo:** FAN (Fã)
- **Time:** Não selecionado (pode escolher depois)
- **Influencer:** Não
- **Avatar:** Não definido

---

## 🚀 Como Criar a Conta

### Passo 1: Configurar DATABASE_URL

1. Abra o arquivo `.env` na raiz do projeto
2. Configure a `DATABASE_URL` correta (peça para seu amigo se necessário)
3. Salve o arquivo

### Passo 2: Executar o Script

```bash
npm run create:account
```

### Passo 3: Ver os Dados

O script vai:
- ✅ Criar a conta no banco
- ✅ Mostrar os dados no terminal
- ✅ Salvar os dados em `test-account.json`

---

## 📄 Arquivo Gerado

Após criar a conta, um arquivo `test-account.json` será criado com:

```json
{
  "email": "teste[timestamp]@exemplo.com",
  "password": "senha123456",
  "name": "Usuario Teste",
  "id": "[uuid-gerado]",
  "teamId": null,
  "userType": "FAN",
  "isInfluencer": false,
  "createdAt": "[data-hora]"
}
```

---

## 🔑 Dados para Login

Depois de criar a conta, use:

- **Email:** (será mostrado no terminal e salvo no arquivo)
- **Senha:** `senha123456`

---

## 💡 Alternativa: Criar via Interface

Se preferir, você também pode:

1. Iniciar o servidor: `npm run dev`
2. Acessar: http://localhost:5001
3. Clicar em "Cadastrar"
4. Preencher os dados manualmente

---

**Última atualização:** Script criado, aguardando DATABASE_URL válida.




