import "dotenv/config";

/**
 * Script para criar uma conta de teste
 */

const API_URL = process.env.API_URL || "http://localhost:5001";

async function createTestAccount() {
  const testUser = {
    name: "Usuario Teste",
    email: `teste${Date.now()}@exemplo.com`, // Email único baseado em timestamp
    password: "senha123456",
    teamId: null, // Pode ser preenchido depois
  };

  console.log("═══════════════════════════════════════════════════════════");
  console.log("     CRIANDO CONTA DE TESTE");
  console.log("═══════════════════════════════════════════════════════════\n");
  console.log("📝 Dados da conta:");
  console.log(`   Nome: ${testUser.name}`);
  console.log(`   Email: ${testUser.email}`);
  console.log(`   Senha: ${testUser.password}`);
  console.log(`   Team ID: ${testUser.teamId || "Não definido"}\n`);

  try {
    console.log(`🔗 Enviando requisição para: ${API_URL}/api/auth/register\n`);

    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUser),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ ERRO ao criar conta:");
      console.error(`   Status: ${response.status}`);
      console.error(`   Mensagem: ${data.message || JSON.stringify(data)}`);
      if (data.errors) {
        console.error(`   Erros de validação:`, data.errors);
      }
      process.exit(1);
    }

    console.log("✅ Conta criada com sucesso!\n");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("     DADOS DA CONTA CRIADA");
    console.log("═══════════════════════════════════════════════════════════\n");
    console.log("📧 Email:", data.email);
    console.log("👤 Nome:", data.name);
    console.log("🆔 ID:", data.id);
    console.log("⚽ Time ID:", data.teamId || "Não selecionado");
    console.log("👑 Tipo:", data.userType);
    console.log("🌟 Influencer:", data.isInfluencer ? "Sim" : "Não");
    console.log("🖼️  Avatar:", data.avatarUrl || "Não definido");
    console.log("\n🔑 Senha:", testUser.password);
    console.log("\n═══════════════════════════════════════════════════════════\n");

    // Salvar em arquivo também
    const accountData = {
      email: data.email,
      password: testUser.password,
      name: data.name,
      id: data.id,
      teamId: data.teamId,
      userType: data.userType,
      createdAt: new Date().toISOString(),
    };

    const fs = await import("fs/promises");
    await fs.writeFile(
      "test-account.json",
      JSON.stringify(accountData, null, 2),
      "utf-8"
    );

    console.log("💾 Dados salvos em: test-account.json\n");

    process.exit(0);
  } catch (error: any) {
    console.error("❌ ERRO ao fazer requisição:");
    console.error(`   ${error.message}`);
    console.error("\n💡 Verifique se o servidor está rodando:");
    console.error("   npm run dev");
    process.exit(1);
  }
}

createTestAccount();






