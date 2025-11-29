/**
 * Database Configuration
 * Centralized database connection settings and pool management
 */
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool as PgPool } from 'pg';
import ws from "ws";
import * as schema from "../../shared/schema";

// Configure WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws;

// Validate environment
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// ============================================
// DATABASE POOL CONFIGURATION
// ============================================

/**
 * Connection pool settings optimized for scalability
 */
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20,                      // Maximum connections in pool
  idleTimeoutMillis: 30000,     // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Connection timeout
};

// ============================================
// EXPORTS
// ============================================

/**
 * Primary pool for Drizzle ORM (Neon serverless)
 */
export const pool = new Pool(poolConfig);

/**
 * Drizzle ORM instance with schema
 */
export const db = drizzle({ client: pool, schema });

/**
 * Session pool for connect-pg-simple
 * Note: connect-pg-simple requires standard pg Pool, not Neon's Pool
 */
export const sessionPool = new PgPool({ 
  connectionString: process.env.DATABASE_URL 
});

