import "dotenv/config";
import { db } from "./server/config/database";
import { users, teams } from "./shared/schema";
import { sql } from "drizzle-orm";

/**
 * Script de diagnóstico do banco de dados
 * Verifica conexão, schema e possíveis problemas
 */

async function diagnoseDatabase() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("     DIAGNÓSTICO DO BANCO DE DADOS");
  console.log("═══════════════════════════════════════════════════════════\n");

  // 1. Verificar DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ ERRO CRÍTICO: DATABASE_URL não está definida no .env");
    console.log("\n💡 SOLUÇÃO:");
    console.log("   1. Abra o arquivo .env na raiz do projeto");
    console.log("   2. Adicione: DATABASE_URL=postgresql://...");
    console.log("   3. Use a mesma URL que seu amigo está usando");
    process.exit(1);
  }

  console.log("✅ DATABASE_URL encontrada");
  
  // Extrair informações básicas da URL (sem mostrar senha completa)
  try {
    const urlParts = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/([^?]+)/);
    if (urlParts) {
      const [, user, , host, database] = urlParts;
      console.log(`   Usuário: ${user}`);
      console.log(`   Host: ${host}`);
      console.log(`   Database: ${database}`);
      console.log(`   Tipo: ${host.includes("neon") ? "Neon (Cloud)" : host.includes("localhost") ? "Local" : "Outro"}`);
    }
  } catch (e) {
    // Ignora erro de parse
  }

  console.log("\n");

  // 2. Testar conexão
  console.log("🔌 Testando conexão com o banco...");
  try {
    await db.execute(sql`SELECT 1`);
    console.log("✅ Conexão com o banco estabelecida com sucesso\n");
  } catch (error: any) {
    console.error("❌ ERRO: Não foi possível conectar ao banco de dados");
    console.error(`   Mensagem: ${error.message}`);
    console.log("\n💡 POSSÍVEIS CAUSAS:");
    console.log("   1. DATABASE_URL incorreta");
    console.log("   2. Banco de dados não está acessível");
    console.log("   3. Credenciais incorretas");
    console.log("   4. Firewall bloqueando a conexão");
    console.log("\n💡 SOLUÇÃO:");
    console.log("   - Verifique se a DATABASE_URL está correta");
    console.log("   - Peça a DATABASE_URL correta para seu amigo");
    console.log("   - Verifique se o banco está rodando (se for local)");
    process.exit(1);
  }

  // 3. Verificar se a tabela users existe
  console.log("📋 Verificando estrutura do banco...");
  try {
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `);
    
    const exists = (tableExists.rows[0] as any)?.exists;
    
    if (!exists) {
      console.error("❌ ERRO: Tabela 'users' não existe no banco de dados");
      console.log("\n💡 SOLUÇÃO:");
      console.log("   Execute: npm run db:push");
      console.log("   Isso vai criar todas as tabelas necessárias");
      process.exit(1);
    }
    console.log("✅ Tabela 'users' existe");

    // Verificar estrutura da tabela users
    const columns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log("\n   Colunas da tabela 'users':");
    (columns.rows as any[]).forEach((col: any) => {
      console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Verificar se as colunas essenciais existem
    const columnNames = (columns.rows as any[]).map((c: any) => c.column_name);
    const requiredColumns = ['id', 'email', 'name', 'password', 'user_type', 'created_at'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    
    if (missingColumns.length > 0) {
      console.error(`\n❌ ERRO: Colunas faltando: ${missingColumns.join(', ')}`);
      console.log("\n💡 SOLUÇÃO:");
      console.log("   Execute: npm run db:push");
      console.log("   Isso vai sincronizar o schema com o banco");
      process.exit(1);
    }
    console.log("✅ Todas as colunas essenciais estão presentes");

  } catch (error: any) {
    console.error("❌ ERRO ao verificar estrutura do banco:");
    console.error(`   ${error.message}`);
    process.exit(1);
  }

  // 4. Verificar se há dados
  console.log("\n📊 Verificando dados existentes...");
  try {
    const usersCount = await db.select().from(users);
    const teamsCount = await db.select().from(teams);
    
    console.log(`   Usuários cadastrados: ${usersCount.length}`);
    console.log(`   Times cadastrados: ${teamsCount.length}`);
    
    if (usersCount.length === 0) {
      console.log("   ⚠️  Nenhum usuário cadastrado ainda (isso é normal se for um banco novo)");
    }
  } catch (error: any) {
    console.error("❌ ERRO ao verificar dados:");
    console.error(`   ${error.message}`);
    console.log("\n💡 Isso pode indicar que o schema não está sincronizado");
  }

  // 5. Verificar enums
  console.log("\n🔍 Verificando enums...");
  try {
    const enums = await db.execute(sql`
      SELECT t.typname as enum_name
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      GROUP BY t.typname
    `);
    
    const enumNames = (enums.rows as any[]).map((e: any) => e.enum_name);
    const requiredEnums = ['user_type', 'player_position', 'news_category', 'interaction_type', 'journalist_status'];
    const missingEnums = requiredEnums.filter(e => !enumNames.includes(e));
    
    if (missingEnums.length > 0) {
      console.error(`❌ ERRO: Enums faltando: ${missingEnums.join(', ')}`);
      console.log("\n💡 SOLUÇÃO:");
      console.log("   Execute: npm run db:push");
    } else {
      console.log("✅ Todos os enums necessários estão presentes");
    }
  } catch (error: any) {
    console.log("⚠️  Não foi possível verificar enums (pode ser normal)");
  }

  // 6. Resumo e recomendações
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("     RESUMO E RECOMENDAÇÕES");
  console.log("═══════════════════════════════════════════════════════════\n");

  console.log("✅ Banco de dados está configurado corretamente!");
  console.log("\n📝 PRÓXIMOS PASSOS:");
  console.log("   1. Se o cadastro ainda não funcionar, verifique os logs do servidor");
  console.log("   2. Execute: npm run db:view (para ver dados do banco)");
  console.log("   3. Teste criar um usuário via API");
  
  console.log("\n💡 LEMBRE-SE:");
  console.log("   - O DBeaver é apenas um cliente de visualização");
  console.log("   - O projeto usa a DATABASE_URL do arquivo .env");
  console.log("   - Você e seu amigo devem usar a MESMA DATABASE_URL");
  console.log("   - O projeto usa Drizzle ORM (não Prisma)");
  console.log("   - Use 'npm run db:push' para sincronizar o schema\n");

  process.exit(0);
}

diagnoseDatabase().catch((error) => {
  console.error("❌ Erro fatal:", error);
  process.exit(1);
});




