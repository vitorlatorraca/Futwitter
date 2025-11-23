// Script rápido para verificar se o servidor pode iniciar
import 'dotenv/config';

console.log('🔍 Verificando configuração...\n');

// Verificar .env
if (!process.env.DATABASE_URL) {
  console.error('❌ ERRO: DATABASE_URL não está definido no .env');
  console.log('📝 Crie um arquivo .env com:');
  console.log('   DATABASE_URL=postgresql://usuario:senha@host:porta/database');
  console.log('   PORT=5001');
  console.log('   SESSION_SECRET=sua-chave-secreta');
  process.exit(1);
}

if (!process.env.SESSION_SECRET) {
  console.warn('⚠️  AVISO: SESSION_SECRET não está definido');
}

console.log('✅ DATABASE_URL configurado');
console.log(`✅ PORT: ${process.env.PORT || '5000'}`);
console.log('\n🚀 Tente rodar: npm run dev\n');








