import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool as PgPool } from 'pg';
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

// Pool for connect-pg-simple (standard pg pool)
// connect-pg-simple requires a standard pg Pool, not Neon's Pool
export const sessionPool = new PgPool({ connectionString: process.env.DATABASE_URL });
