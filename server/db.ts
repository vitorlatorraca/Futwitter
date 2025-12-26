import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Pool for Drizzle (Neon serverless)
// Configuração otimizada para escalabilidade
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000, // Fechar conexões idle após 30s
  connectionTimeoutMillis: 2000, // Timeout de conexão
});
export const db = drizzle({ client: pool, schema });

