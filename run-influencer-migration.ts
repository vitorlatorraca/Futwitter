import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from './server/db.js';

async function runMigration() {
  try {
    console.log('📦 Lendo migration SQL...');
    const migrationSQL = readFileSync(
      join(process.cwd(), 'migrations', 'create_influencer_requests_table.sql'),
      'utf-8'
    );

    console.log('🚀 Executando migration...');
    
    // Execute the entire SQL file
    await pool.query(migrationSQL);

    console.log('✅ Migration executada com sucesso!');
    console.log('📊 Tabela influencer_requests criada.');
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro ao executar migration:', error.message);
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log('ℹ️  A tabela já existe. Tudo certo!');
      await pool.end();
      process.exit(0);
    }
    await pool.end();
    process.exit(1);
  }
}

runMigration();

