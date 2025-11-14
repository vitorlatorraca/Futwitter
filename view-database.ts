import "dotenv/config";
import { db } from "./server/db";
import { users, teams, news, journalists, players, matches, newsInteractions, playerRatings } from "@shared/schema";
import { eq, count, desc } from "drizzle-orm";

async function viewDatabase() {
  try {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("           VISÃO GERAL DA BASE DE DADOS");
    console.log("═══════════════════════════════════════════════════════════\n");

    // Contar registros
    const [usersCount] = await db.select({ count: count() }).from(users);
    const [teamsCount] = await db.select({ count: count() }).from(teams);
    const [newsCount] = await db.select({ count: count() }).from(news);
    const [journalistsCount] = await db.select({ count: count() }).from(journalists);
    const [playersCount] = await db.select({ count: count() }).from(players);
    const [matchesCount] = await db.select({ count: count() }).from(matches);
    const [interactionsCount] = await db.select({ count: count() }).from(newsInteractions);
    const [ratingsCount] = await db.select({ count: count() }).from(playerRatings);

    console.log("📊 ESTATÍSTICAS GERAIS:");
    console.log(`   👥 Usuários: ${usersCount.count}`);
    console.log(`   ⚽ Times: ${teamsCount.count}`);
    console.log(`   📰 Notícias: ${newsCount.count}`);
    console.log(`   ✍️  Jornalistas: ${journalistsCount.count}`);
    console.log(`   🏃 Jogadores: ${playersCount.count}`);
    console.log(`   🎮 Partidas: ${matchesCount.count}`);
    console.log(`   👍 Interações (Likes/Dislikes): ${interactionsCount.count}`);
    console.log(`   ⭐ Avaliações de Jogadores: ${ratingsCount.count}\n`);

    // Usuários
    console.log("👥 USUÁRIOS:");
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt)).limit(10);
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      console.log(`      Tipo: ${user.userType} | Influencer: ${user.isInfluencer ? 'Sim' : 'Não'} | Time: ${user.teamId || 'N/A'}`);
    });
    if (usersCount.count > 10) {
      console.log(`   ... e mais ${usersCount.count - 10} usuários\n`);
    } else {
      console.log("");
    }

    // Times
    console.log("⚽ TIMES:");
    const allTeams = await db.select().from(teams).orderBy(teams.name);
    allTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.name} (${team.shortName})`);
      console.log(`      ID: ${team.id} | Pontos: ${team.points} | Posição: ${team.currentPosition || 'N/A'}`);
    });
    console.log("");

    // Notícias
    console.log("📰 NOTÍCIAS (últimas 10):");
    const recentNews = await db
      .select()
      .from(news)
      .orderBy(desc(news.createdAt))
      .limit(10);
    
    for (const newsItem of recentNews) {
      const author = newsItem.userId 
        ? await db.select().from(users).where(eq(users.id, newsItem.userId)).limit(1)
        : null;
      
      const team = await db.select().from(teams).where(eq(teams.id, newsItem.teamId)).limit(1);
      
      console.log(`   • ${newsItem.title}`);
      console.log(`     Time: ${team[0]?.name || 'N/A'} | Autor: ${author?.[0]?.name || 'Jornalista'} | Publicada: ${newsItem.isPublished ? 'Sim' : 'Não'}`);
      console.log(`     Tem imagem: ${newsItem.imageUrl ? 'Sim' : 'Não'} | Likes: ${newsItem.likesCount} | Dislikes: ${newsItem.dislikesCount}`);
      console.log(`     Criada em: ${new Date(newsItem.createdAt).toLocaleString('pt-BR')}`);
    }
    if (newsCount.count > 10) {
      console.log(`   ... e mais ${newsCount.count - 10} notícias\n`);
    } else {
      console.log("");
    }

    // Notícias por time
    console.log("📰 NOTÍCIAS POR TIME:");
    const newsByTeam = await db
      .select({
        teamId: news.teamId,
        count: count(),
      })
      .from(news)
      .groupBy(news.teamId);
    
    for (const item of newsByTeam) {
      const team = await db.select().from(teams).where(eq(teams.id, item.teamId)).limit(1);
      console.log(`   ${team[0]?.name || item.teamId}: ${item.count} notícias`);
    }
    console.log("");

    // Influencers
    console.log("🌟 INFLUENCERS:");
    const influencers = await db
      .select()
      .from(users)
      .where(eq(users.isInfluencer, true));
    
    if (influencers.length === 0) {
      console.log("   Nenhum influencer cadastrado\n");
    } else {
      for (const inf of influencers) {
        const team = allTeams.find(t => t.id === inf.teamId);
        const [newsCountResult] = await db
          .select({ count: count() })
          .from(news)
          .where(eq(news.userId, inf.id));
        
        console.log(`   • ${inf.name} (${inf.email})`);
        console.log(`     Time: ${team?.name || inf.teamId || 'N/A'}`);
        console.log(`     Notícias criadas: ${newsCountResult.count}`);
      }
      console.log("");
    }

    // Jornalistas
    console.log("✍️  JORNALISTAS:");
    const allJournalists = await db.select().from(journalists);
    for (const journalist of allJournalists) {
      const user = await db.select().from(users).where(eq(users.id, journalist.userId)).limit(1);
      const newsCount = await db.select({ count: count() }).from(news).where(eq(news.journalistId, journalist.id));
      console.log(`   • ${user[0]?.name || 'N/A'} (${journalist.organization})`);
      console.log(`     Status: ${journalist.status} | Notícias: ${newsCount[0]?.count || 0}`);
    }
    console.log("");

    // Estatísticas de notícias
    console.log("📊 ESTATÍSTICAS DE NOTÍCIAS:");
    const publishedNews = await db.select({ count: count() }).from(news).where(eq(news.isPublished, true));
    const unpublishedNews = await db.select({ count: count() }).from(news).where(eq(news.isPublished, false));
    console.log(`   Publicadas: ${publishedNews[0]?.count || 0}`);
    console.log(`   Não publicadas: ${unpublishedNews[0]?.count || 0}`);
    
    const allNewsForStats = await db.select().from(news);
    const withImage = allNewsForStats.filter(n => n.imageUrl && n.imageUrl.trim() !== '');
    const withoutImage = allNewsForStats.filter(n => !n.imageUrl || n.imageUrl.trim() === '');
    console.log(`   Com imagem: ${withImage.length}`);
    console.log(`   Sem imagem: ${withoutImage.length}\n`);

    console.log("═══════════════════════════════════════════════════════════");
    console.log("           FIM DA VISÃO GERAL");
    console.log("═══════════════════════════════════════════════════════════\n");

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

viewDatabase();

