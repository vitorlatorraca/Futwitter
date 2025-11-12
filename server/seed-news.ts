import { db } from "./db";
import { news, journalists, users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedNews() {
  console.log("Starting news seed...");

  try {
    // Get the journalist
    const [journalistUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, "jornalista@brasileirao.com"));

    if (!journalistUser) {
      console.error("Journalist user not found");
      return;
    }

    const [journalist] = await db
      .select()
      .from(journalists)
      .where(eq(journalists.userId, journalistUser.id));

    if (!journalist) {
      console.error("Journalist not found");
      return;
    }

    const newsItems = [
      {
        journalistId: journalist.id,
        teamId: "flamengo",
        category: "NEWS" as const,
        title: "Flamengo anuncia contratação de novo atacante para a temporada",
        content: "O Clube de Regatas do Flamengo oficializou nesta tarde a contratação do atacante que estava atuando no exterior. O jogador chega para reforçar o time nas competições da temporada e já está integrado ao elenco rubro-negro.",
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        journalistId: journalist.id,
        teamId: "palmeiras",
        category: "ANALYSIS" as const,
        title: "Análise tática: Como o Palmeiras dominou o meio-campo na última partida",
        content: "O técnico do Palmeiras apresentou uma formação inovadora que surpreendeu o adversário. A equipe demonstrou grande controle de bola e criou diversas oportunidades de gol através de passes precisos no meio-campo.",
        isPublished: true,
        publishedAt: new Date(Date.now() - 3600000),
      },
      {
        journalistId: journalist.id,
        teamId: "corinthians",
        category: "BACKSTAGE" as const,
        title: "Bastidores: Treino intenso do Corinthians visando próximo confronto",
        content: "A comissão técnica do Corinthians promoveu um treino tático focado em jogadas de bola parada. Os jogadores demonstraram alta concentração e estão confiantes para o próximo desafio no campeonato brasileiro.",
        isPublished: true,
        publishedAt: new Date(Date.now() - 7200000),
      },
      {
        journalistId: journalist.id,
        teamId: "sao-paulo",
        category: "MARKET" as const,
        title: "São Paulo negocia renovação de contrato com jogador destaque",
        content: "O São Paulo Futebol Clube está em negociações avançadas para renovar o contrato de um dos seus principais jogadores. A diretoria trabalha para manter o atleta que tem sido fundamental nos resultados positivos do time.",
        isPublished: true,
        publishedAt: new Date(Date.now() - 10800000),
      },
      {
        journalistId: journalist.id,
        teamId: "flamengo",
        category: "NEWS" as const,
        title: "Preparação do Flamengo para clássico promete grande espetáculo",
        content: "O elenco do Flamengo se prepara intensamente para o clássico carioca do fim de semana. Os jogadores estão focados e a torcida já se mobiliza para lotar o estádio e apoiar o time.",
        isPublished: true,
        publishedAt: new Date(Date.now() - 14400000),
      },
    ];

    for (const newsItem of newsItems) {
      await db.insert(news).values(newsItem);
    }

    console.log(`✅ Seeded ${newsItems.length} news items successfully!`);
  } catch (error) {
    console.error("❌ Error seeding news:", error);
    throw error;
  }
}

seedNews().then(() => {
  console.log("News seed complete!");
  process.exit(0);
}).catch((error) => {
  console.error("News seed failed:", error);
  process.exit(1);
});
