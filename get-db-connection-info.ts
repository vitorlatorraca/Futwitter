import "dotenv/config";

/**
 * Script para extrair informações de conexão do banco de dados
 * Útil para configurar o DBeaver
 */

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL não encontrada no arquivo .env");
  console.log("\n💡 Certifique-se de que o arquivo .env existe e contém:");
  console.log("   DATABASE_URL=postgresql://user:password@host:port/database");
  process.exit(1);
}

console.log("═══════════════════════════════════════════════════════════");
console.log("     INFORMAÇÕES DE CONEXÃO PARA O DBEAVER");
console.log("═══════════════════════════════════════════════════════════\n");

try {
  // Parse da URL do PostgreSQL
  // Formato: postgresql://user:password@host:port/database?params
  // Primeiro, tenta fazer decode da URL caso tenha caracteres codificados
  let urlToParse = databaseUrl;
  
  // Remove o protocolo para fazer parse manual
  if (!urlToParse.startsWith("postgresql://")) {
    throw new Error("URL deve começar com postgresql://");
  }
  
  // Extrai a parte após postgresql://
  const afterProtocol = urlToParse.substring(14); // "postgresql://".length = 14
  
  // Encontra o @ que separa credenciais do host
  const atIndex = afterProtocol.indexOf("@");
  if (atIndex === -1) {
    throw new Error("Formato de URL inválido: não encontrou @");
  }
  
  // Separa credenciais e resto
  const credentials = afterProtocol.substring(0, atIndex);
  const rest = afterProtocol.substring(atIndex + 1);
  
  // Separa usuário e senha
  const colonIndex = credentials.indexOf(":");
  if (colonIndex === -1) {
    throw new Error("Formato de URL inválido: não encontrou : nas credenciais");
  }
  
  const username = decodeURIComponent(credentials.substring(0, colonIndex));
  const password = decodeURIComponent(credentials.substring(colonIndex + 1));
  
  // Parse do host, porta e database
  // Formato: host:port/database?params ou host/database?params
  const slashIndex = rest.indexOf("/");
  if (slashIndex === -1) {
    throw new Error("Formato de URL inválido: não encontrou / após host");
  }
  
  const hostPort = rest.substring(0, slashIndex);
  const dbAndParams = rest.substring(slashIndex + 1);
  
  // Separa host e porta
  const portColonIndex = hostPort.indexOf(":");
  const host = hostPort.substring(0, portColonIndex === -1 ? hostPort.length : portColonIndex);
  const portNum = portColonIndex === -1 ? "5432" : hostPort.substring(portColonIndex + 1);
  
  // Separa database e parâmetros
  const questionIndex = dbAndParams.indexOf("?");
  const database = questionIndex === -1 ? dbAndParams : dbAndParams.substring(0, questionIndex);
  const queryString = questionIndex === -1 ? "" : dbAndParams.substring(questionIndex + 1);
  
  // Parse dos parâmetros de query
  const params = new URLSearchParams(queryString);
  const sslMode = params.get("sslmode") || (host.includes("neon") ? "require" : "prefer");
  

  console.log("📋 CONFIGURAÇÕES PARA O DBEAVER:\n");
  console.log(`   Host:     ${host}`);
  console.log(`   Port:     ${portNum}`);
  console.log(`   Database: ${database}`);
  console.log(`   User:     ${username}`);
  console.log(`   Password: ${password ? "***" + password.slice(-2) : "(não definida)"}`);
  console.log(`   SSL Mode: ${sslMode}\n`);

  console.log("═══════════════════════════════════════════════════════════");
  console.log("     PASSOS PARA CONFIGURAR NO DBEAVER:");
  console.log("═══════════════════════════════════════════════════════════\n");
  
  console.log("1. Abra o DBeaver");
  console.log("2. Clique em 'Nova Conexão' (ícone de plug) ou Database > New Database Connection");
  console.log("3. Selecione 'PostgreSQL'");
  console.log("4. Na aba 'Main', preencha:");
  console.log(`   - Host:     ${host}`);
  console.log(`   - Port:     ${portNum}`);
  console.log(`   - Database: ${database}`);
  console.log(`   - Username: ${username}`);
  console.log(`   - Password: ${password ? "(use a senha do seu .env)" : "(deixe vazio ou use a senha padrão)"}`);
  console.log("\n5. Na aba 'SSL', configure:");
  if (sslMode === "require" || host.includes("neon") || host.includes("aws")) {
    console.log("   - Marque 'Use SSL'");
    console.log("   - SSL Mode: Require");
  } else {
    console.log("   - Deixe desmarcado 'Use SSL' (ou marque 'Prefer' se preferir)");
  }
  console.log("\n6. Clique em 'Test Connection' para testar");
  console.log("7. Se funcionar, clique em 'Finish'\n");

  console.log("═══════════════════════════════════════════════════════════\n");
  console.log("💡 DICA: Se a conexão falhar, verifique:");
  console.log("   - Se o banco está acessível (Neon, local, etc)");
  console.log("   - Se a senha está correta");
  console.log("   - Se precisa de SSL (geralmente sim para Neon)");

} catch (error: any) {
  console.error("❌ Erro ao processar DATABASE_URL:", error.message);
  console.log("\n📝 Sua DATABASE_URL atual:");
  console.log(`   ${databaseUrl.substring(0, 50)}...`);
  console.log("\n💡 GUIA MANUAL:");
  console.log("   A DATABASE_URL geralmente tem o formato:");
  console.log("   postgresql://usuario:senha@host:porta/banco");
  console.log("\n   Exemplo Neon:");
  console.log("   postgresql://user:pass@ep-xxx-xxx.region.aws.neon.tech/db?sslmode=require");
  console.log("\n   Exemplo Local:");
  console.log("   postgresql://postgres:senha@localhost:5432/brasileiraodataflow");
  console.log("\n   Para configurar no DBeaver manualmente:");
  console.log("   1. Extraia: host, porta, database, usuário e senha da URL acima");
  console.log("   2. Use essas informações no DBeaver");
  process.exit(1);
}

