import "dotenv/config";
import { db } from "./server/db";
import { users } from "./shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

/**
 * Script para criar uma conta diretamente no banco de dados
 */

async function createAccountDirect() {
  const testUser = {
    name: "Usuario Teste",
    email: `teste${Date.now()}@exemplo.com`,
    password: "senha123456",
    teamId: null,
  };

  console.log("═══════════════════════════════════════════════════════════");
  console.log("     CRIANDO CONTA DIRETAMENTE NO BANCO");
  console.log("═══════════════════════════════════════════════════════════\n");
  console.log("📝 Dados da conta:");
  console.log(`   Nome: ${testUser.name}`);
  console.log(`   Email: ${testUser.email}`);
  console.log(`   Senha: ${testUser.password}`);
  console.log(`   Team ID: ${testUser.teamId || "Não definido"}\n`);

  try {
    // Verificar se o email já existe
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, testUser.email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log("⚠️  Email já existe, gerando novo email...");
      testUser.email = `teste${Date.now()}@exemplo.com`;
    }

    // Hash da senha
    console.log("🔐 Gerando hash da senha...");
    const hashedPassword = await bcrypt.hash(testUser.password, 10);

    // Criar usuário
    console.log("👤 Criando usuário no banco...");
    const [newUser] = await db
      .insert(users)
      .values({
        name: testUser.name,
        email: testUser.email,
        password: hashedPassword,
        teamId: testUser.teamId,
        userType: "FAN",
        isInfluencer: false,
      })
      .returning();

    if (!newUser) {
      throw new Error("Falha ao criar usuário");
    }

    console.log("✅ Conta criada com sucesso!\n");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("     DADOS DA CONTA CRIADA");
    console.log("═══════════════════════════════════════════════════════════\n");
    console.log("📧 Email:", newUser.email);
    console.log("👤 Nome:", newUser.name);
    console.log("🆔 ID:", newUser.id);
    console.log("⚽ Time ID:", newUser.teamId || "Não selecionado");
    console.log("👑 Tipo:", newUser.userType);
    console.log("🌟 Influencer:", newUser.isInfluencer ? "Sim" : "Não");
    console.log("🖼️  Avatar:", newUser.avatarUrl || "Não definido");
    console.log("📅 Criado em:", newUser.createdAt);
    console.log("\n🔑 Senha:", testUser.password);
    console.log("\n═══════════════════════════════════════════════════════════\n");

    // Salvar em arquivo
    const accountData = {
      email: newUser.email,
      password: testUser.password,
      name: newUser.name,
      id: newUser.id,
      teamId: newUser.teamId,
      userType: newUser.userType,
      isInfluencer: newUser.isInfluencer,
      createdAt: newUser.createdAt,
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
    console.error("❌ ERRO ao criar conta:");
    console.error(`   ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    process.exit(1);
  }
}

createAccountDirect();

