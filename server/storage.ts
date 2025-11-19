import { db } from "./db";
import { eq, and, desc, or, sql, isNotNull, inArray } from "drizzle-orm";
import {
  users,
  journalists,
  teams,
  players,
  matches,
  matchPlayers,
  news,
  newsInteractions,
  playerRatings,
  badges,
  userBadges,
  transfers,
  influencerRequests,
  type User,
  type InsertUser,
  type Journalist,
  type InsertJournalist,
  type Team,
  type InsertTeam,
  type Player,
  type InsertPlayer,
  type Match,
  type InsertMatch,
  type News,
  type InsertNews,
  type NewsInteraction,
  type InsertNewsInteraction,
  type PlayerRating,
  type InsertPlayerRating,
  type Badge,
  type UserBadge,
  type InsertUserBadge,
  type Transfer,
  type InsertTransfer,
  type InfluencerRequest,
  type InsertInfluencerRequest,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  updateUserInfluencerStatus(userId: string, isInfluencer: boolean): Promise<User | undefined>;

  // Journalists
  getJournalist(userId: string): Promise<Journalist | undefined>;
  createJournalist(journalist: InsertJournalist): Promise<Journalist>;

  // Teams
  getAllTeams(): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;

  // Players
  getPlayersByTeam(teamId: string): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;

  // Matches
  getMatchesByTeam(teamId: string, limit?: number): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;

  // News
  getAllNews(teamId?: string, limit?: number, offset?: number): Promise<any[]>;
  getNewsByJournalist(journalistId: string): Promise<News[]>;
  getNewsByUser(userId: string): Promise<News[]>;
  createNews(news: InsertNews): Promise<News>;
  updateNews(id: string, data: Partial<News>): Promise<News | undefined>;
  deleteNews(id: string): Promise<void>;

  // News Interactions
  getUserNewsInteraction(userId: string, newsId: string): Promise<NewsInteraction | undefined>;
  createNewsInteraction(interaction: InsertNewsInteraction): Promise<NewsInteraction>;
  deleteNewsInteraction(userId: string, newsId: string): Promise<void>;
  recalculateNewsCounts(newsId: string): Promise<void>;

  // Player Ratings
  createPlayerRating(rating: InsertPlayerRating): Promise<PlayerRating>;
  getPlayerRatings(playerId: string): Promise<PlayerRating[]>;
  getPlayerAverageRating(playerId: string): Promise<number | null>;

  // Badges
  getAllBadges(): Promise<Badge[]>;
  getUserBadges(userId: string): Promise<any[]>;
  awardBadge(userId: string, badgeId: string): Promise<UserBadge>;
  checkAndAwardBadges(userId: string): Promise<UserBadge[]>;

  // Transfers
  getTransfersByTeam(teamId: string, limit?: number): Promise<Transfer[]>;
  createTransfer(transfer: InsertTransfer): Promise<Transfer>;

  // Influencer Requests
  createInfluencerRequest(request: InsertInfluencerRequest): Promise<InfluencerRequest>;
  getInfluencerRequestByUserId(userId: string): Promise<InfluencerRequest | undefined>;
  getAllInfluencerRequests(status?: string): Promise<(InfluencerRequest & { user: User })[]>;
  updateInfluencerRequestStatus(requestId: string, status: string, reviewedBy: string): Promise<InfluencerRequest | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.name);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserInfluencerStatus(userId: string, isInfluencer: boolean): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isInfluencer, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  // Journalists
  async getJournalist(userId: string): Promise<Journalist | undefined> {
    const [journalist] = await db
      .select()
      .from(journalists)
      .where(eq(journalists.userId, userId));
    return journalist || undefined;
  }

  async createJournalist(insertJournalist: InsertJournalist): Promise<Journalist> {
    const [journalist] = await db
      .insert(journalists)
      .values(insertJournalist)
      .returning();
    return journalist;
  }

  // Teams
  async getAllTeams(): Promise<Team[]> {
    return await db.select().from(teams).orderBy(teams.name);
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const [team] = await db.insert(teams).values(insertTeam).returning();
    return team;
  }

  // Players
  async getPlayersByTeam(teamId: string): Promise<Player[]> {
    return await db
      .select()
      .from(players)
      .where(eq(players.teamId, teamId))
      .orderBy(players.jerseyNumber);
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db.insert(players).values(insertPlayer).returning();
    return player;
  }

  // Matches
  async getMatchesByTeam(teamId: string, limit = 10): Promise<Match[]> {
    return await db
      .select()
      .from(matches)
      .where(eq(matches.teamId, teamId))
      .orderBy(desc(matches.matchDate))
      .limit(limit);
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const [match] = await db.insert(matches).values(insertMatch).returning();
    return match;
  }

  async getLastMatch(teamId: string): Promise<(Match & { players: (Player & { wasStarter: boolean; averageRating?: number })[] }) | null> {
    const [lastMatch] = await db
      .select()
      .from(matches)
      .where(and(
        eq(matches.teamId, teamId),
        eq(matches.status, 'FINISHED')
      ))
      .orderBy(desc(matches.matchDate))
      .limit(1);

    if (!lastMatch) return null;

    // Get players from this match
    const matchPlayersList = await db
      .select({
        player: players,
        wasStarter: matchPlayers.wasStarter,
      })
      .from(matchPlayers)
      .innerJoin(players, eq(matchPlayers.playerId, players.id))
      .where(eq(matchPlayers.matchId, lastMatch.id));

    // Get average ratings for each player in this match
    const playersWithRatings = await Promise.all(
      matchPlayersList.map(async ({ player, wasStarter }) => {
        const ratings = await db
          .select()
          .from(playerRatings)
          .where(and(
            eq(playerRatings.playerId, player.id),
            eq(playerRatings.matchId, lastMatch.id)
          ));

        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : null;

        return {
          ...player,
          wasStarter,
          averageRating: averageRating || undefined,
        };
      })
    );

    return {
      ...lastMatch,
      players: playersWithRatings,
    };
  }

  async getUpcomingMatches(teamId: string, limit = 3): Promise<Match[]> {
    return await db
      .select()
      .from(matches)
      .where(and(
        eq(matches.teamId, teamId),
        eq(matches.status, 'SCHEDULED')
      ))
      .orderBy(matches.matchDate)
      .limit(limit);
  }

  async getStandings(): Promise<Team[]> {
    return await db
      .select()
      .from(teams)
      .orderBy(desc(teams.points), desc(teams.wins), teams.name);
  }

  async getPlayerRatingForMatch(playerId: string, matchId: string, userId: string): Promise<PlayerRating | undefined> {
    const [rating] = await db
      .select()
      .from(playerRatings)
      .where(and(
        eq(playerRatings.playerId, playerId),
        eq(playerRatings.matchId, matchId),
        eq(playerRatings.userId, userId)
      ))
      .limit(1);
    return rating || undefined;
  }

  async getPlayerAverageRatingForMatch(playerId: string, matchId: string): Promise<number | null> {
    const ratings = await db
      .select()
      .from(playerRatings)
      .where(and(
        eq(playerRatings.playerId, playerId),
        eq(playerRatings.matchId, matchId)
      ));

    if (ratings.length === 0) return null;
    
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / ratings.length;
  }

  // News
  async getAllNews(teamId?: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    try {
      // Construir condições base
      const baseConditions = teamId 
        ? and(eq(news.isPublished, true), eq(news.teamId, teamId))
        : eq(news.isPublished, true);

      // Buscar notícias com paginação
      // Usar SQL direto para compatibilidade com banco que pode não ter as colunas novas
      let allNewsItems: any[];
      try {
        allNewsItems = await db
          .select()
          .from(news)
          .where(baseConditions)
          .orderBy(desc(news.publishedAt))
          .limit(limit)
          .offset(offset);
      } catch (error: any) {
        // Se falhar por causa de colunas que não existem, usar SQL direto
        if (error.message && (error.message.includes('video_url') || error.message.includes('content_type'))) {
          console.log('[getAllNews] Colunas novas não existem, usando query compatível...');
          const whereClause = teamId 
            ? sql`is_published = true AND team_id = ${teamId}`
            : sql`is_published = true`;
          
          const result = await db.execute(sql`
            SELECT 
              id, journalist_id, user_id, team_id, title, content, image_url,
              NULL::text as video_url,
              'TEXT'::text as content_type,
              category, likes_count, dislikes_count, is_published, 
              published_at, created_at, updated_at
            FROM news
            WHERE ${whereClause}
            ORDER BY published_at DESC
            LIMIT ${limit}
            OFFSET ${offset}
          `);
          
          // Converter resultado para formato esperado (snake_case -> camelCase)
          // Neon serverless pode retornar de formas diferentes
          let rows: any[];
          if (Array.isArray(result)) {
            rows = result;
          } else if ((result as any).rows) {
            rows = (result as any).rows;
          } else {
            rows = [];
          }
          
          allNewsItems = rows.map((row: any) => ({
            id: row.id,
            journalistId: row.journalist_id,
            userId: row.user_id,
            teamId: row.team_id,
            title: row.title,
            content: row.content,
            imageUrl: row.image_url,
            videoUrl: null,
            contentType: 'TEXT',
            category: row.category,
            likesCount: row.likes_count,
            dislikesCount: row.dislikes_count,
            isPublished: row.is_published,
            publishedAt: row.published_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));
        } else {
          throw error;
        }
      }

      if (allNewsItems.length === 0) {
        return [];
      }

      // OTIMIZAÇÃO: Buscar todos os dados relacionados em batch (evita N+1)
      // 1. Coletar todos os IDs únicos
      const teamIds = [...new Set(allNewsItems.map(n => n.teamId))];
      const journalistIds = [...new Set(allNewsItems.map(n => n.journalistId).filter(Boolean))];
      const userIds = [...new Set(allNewsItems.map(n => n.userId).filter(Boolean))];

      // 2. Buscar todos os times de uma vez (batch query - evita N+1)
      const allTeamsMap = new Map<string, any>();
      if (teamIds.length > 0) {
        const allTeams = await db
          .select()
          .from(teams)
          .where(inArray(teams.id, teamIds));
        allTeams.forEach(team => allTeamsMap.set(team.id, team));
      }

      // 3. Buscar todos os jornalistas de uma vez (batch query)
      const journalistsMap = new Map<string, any>();
      const journalistUserIds: string[] = [];
      if (journalistIds.length > 0) {
        const allJournalists = await db
          .select()
          .from(journalists)
          .where(inArray(journalists.id, journalistIds));
        allJournalists.forEach(j => {
          journalistsMap.set(j.id, j);
          journalistUserIds.push(j.userId);
        });
      }

      // 4. Buscar todos os usuários de uma vez (batch query - jornalistas + influencers)
      const allUserIds = [...new Set([...journalistUserIds, ...userIds])];
      const usersMap = new Map<string, any>();
      if (allUserIds.length > 0) {
        const allUsers = await db
          .select()
          .from(users)
          .where(inArray(users.id, allUserIds));
        allUsers.forEach(user => usersMap.set(user.id, user));
      }

      // 5. Construir resultado enriquecido
      const enrichedNews = allNewsItems.map((newsItem) => {
        try {
          const team = allTeamsMap.get(newsItem.teamId);
          if (!team) {
            return null;
          }

          let authorName = 'Unknown Author';
          let journalistData = null;

          // Se tem journalistId, buscar dados do jornalista
          if (newsItem.journalistId) {
            const journalist = journalistsMap.get(newsItem.journalistId);
            if (journalist) {
              const journalistUser = usersMap.get(journalist.userId);
              if (journalistUser) {
                authorName = journalistUser.name;
                journalistData = {
                  id: journalist.id,
                  user: {
                    name: journalistUser.name,
                    avatarUrl: journalistUser.avatarUrl,
                  },
                };
              }
            }
          }
          // Se tem userId (influencer), buscar dados do usuário
          else if (newsItem.userId) {
            const influencerUser = usersMap.get(newsItem.userId);
            if (influencerUser) {
              authorName = influencerUser.name;
              journalistData = {
                user: {
                  name: influencerUser.name,
                  avatarUrl: influencerUser.avatarUrl,
                },
              };
            }
          }

          return {
            id: newsItem.id,
            journalistId: newsItem.journalistId,
            userId: newsItem.userId,
            teamId: newsItem.teamId,
            title: newsItem.title,
            content: newsItem.content,
            imageUrl: newsItem.imageUrl,
            videoUrl: (newsItem as any).videoUrl || null, // Campo novo, pode não existir
            contentType: (newsItem as any).contentType || 'TEXT', // Campo novo, default TEXT
            category: newsItem.category,
            likesCount: newsItem.likesCount,
            dislikesCount: newsItem.dislikesCount,
            isPublished: newsItem.isPublished,
            publishedAt: newsItem.publishedAt,
            createdAt: newsItem.createdAt,
            updatedAt: newsItem.updatedAt,
            team: {
              id: team.id,
              name: team.name,
              logoUrl: team.logoUrl,
              primaryColor: team.primaryColor,
              secondaryColor: team.secondaryColor,
            },
            journalist: journalistData,
            author: newsItem.userId ? { 
              name: authorName,
              avatarUrl: usersMap.get(newsItem.userId)?.avatarUrl || null
            } : null,
          };
        } catch (itemError: any) {
          console.error(`[getAllNews] Error processing news item ${newsItem.id}:`, itemError);
          return null;
        }
      });

      // Filtrar nulls e retornar
      return enrichedNews.filter((item): item is NonNullable<typeof item> => item !== null);
    } catch (error: any) {
      console.error('Error in getAllNews:', error);
      throw error;
    }
  }

  async getNewsByJournalist(journalistId: string): Promise<News[]> {
    try {
      return await db
        .select()
        .from(news)
        .where(eq(news.journalistId, journalistId))
        .orderBy(desc(news.publishedAt));
    } catch (error: any) {
      if (error.message && (error.message.includes('video_url') || error.message.includes('content_type'))) {
        // Fallback: usar query sem colunas novas
        const result = await db.execute(sql`
          SELECT * FROM news 
          WHERE journalist_id = ${journalistId}
          ORDER BY published_at DESC
        `);
        const rows = Array.isArray(result) ? result : ((result as any).rows || []);
        return rows.map((row: any) => ({
          ...row,
          journalistId: row.journalist_id,
          userId: row.user_id,
          teamId: row.team_id,
          imageUrl: row.image_url,
          videoUrl: null,
          contentType: 'TEXT',
          likesCount: row.likes_count,
          dislikesCount: row.dislikes_count,
          isPublished: row.is_published,
          publishedAt: row.published_at,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      }
      throw error;
    }
  }

  async getNewsByUser(userId: string): Promise<News[]> {
    try {
      return await db
        .select()
        .from(news)
        .where(eq(news.userId, userId))
        .orderBy(desc(news.publishedAt));
    } catch (error: any) {
      if (error.message && (error.message.includes('video_url') || error.message.includes('content_type'))) {
        // Fallback: usar query sem colunas novas
        const result = await db.execute(sql`
          SELECT * FROM news 
          WHERE user_id = ${userId}
          ORDER BY published_at DESC
        `);
        const rows = Array.isArray(result) ? result : ((result as any).rows || []);
        return rows.map((row: any) => ({
          ...row,
          journalistId: row.journalist_id,
          userId: row.user_id,
          teamId: row.team_id,
          imageUrl: row.image_url,
          videoUrl: null,
          contentType: 'TEXT',
          likesCount: row.likes_count,
          dislikesCount: row.dislikes_count,
          isPublished: row.is_published,
          publishedAt: row.published_at,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      }
      throw error;
    }
  }

  async createNews(insertNews: InsertNews): Promise<News> {
    console.log(`[createNews] Creating news with data:`, { 
      teamId: insertNews.teamId, 
      userId: (insertNews as any).userId, 
      journalistId: (insertNews as any).journalistId,
      title: insertNews.title,
      contentType: (insertNews as any).contentType,
      isPublished: (insertNews as any).isPublished 
    });
    
    // Preparar dados para inserção (remover campos undefined)
    const newsData: any = {
      ...insertNews,
      isPublished: (insertNews as any).isPublished !== undefined ? (insertNews as any).isPublished : true,
    };
    
    // Adicionar campos novos apenas se existirem
    if ((insertNews as any).contentType) {
      newsData.contentType = (insertNews as any).contentType;
    }
    if ((insertNews as any).videoUrl) {
      newsData.videoUrl = (insertNews as any).videoUrl;
    }
    
    try {
      const [newsItem] = await db.insert(news).values(newsData).returning();
      console.log(`[createNews] News created:`, { id: newsItem.id, teamId: newsItem.teamId, userId: newsItem.userId, isPublished: newsItem.isPublished });
      return newsItem;
    } catch (error: any) {
      // Se falhar por causa de colunas que não existem, usar SQL direto
      if (error.message && (error.message.includes('video_url') || error.message.includes('content_type'))) {
        console.log('[createNews] Colunas novas não existem, usando insert compatível...');
        // Remover campos novos do insert
        const { contentType, videoUrl, ...newsDataWithoutNewFields } = newsData;
        const [newsItem] = await db.insert(news).values(newsDataWithoutNewFields).returning();
        return { ...newsItem, contentType: 'TEXT', videoUrl: null } as any;
      }
      throw error;
    }
  }

  async updateNews(id: string, data: Partial<News>): Promise<News | undefined> {
    const [newsItem] = await db
      .update(news)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(news.id, id))
      .returning();
    return newsItem || undefined;
  }

  async deleteNews(id: string): Promise<void> {
    await db.delete(news).where(eq(news.id, id));
  }

  // News Interactions
  async getUserNewsInteraction(userId: string, newsId: string): Promise<NewsInteraction | undefined> {
    const [interaction] = await db
      .select()
      .from(newsInteractions)
      .where(
        and(
          eq(newsInteractions.userId, userId),
          eq(newsInteractions.newsId, newsId)
        )
      );
    return interaction || undefined;
  }

  async createNewsInteraction(insertInteraction: InsertNewsInteraction): Promise<NewsInteraction> {
    const [interaction] = await db
      .insert(newsInteractions)
      .values(insertInteraction)
      .returning();
    return interaction;
  }

  async deleteNewsInteraction(userId: string, newsId: string): Promise<void> {
    await db
      .delete(newsInteractions)
      .where(
        and(
          eq(newsInteractions.userId, userId),
          eq(newsInteractions.newsId, newsId)
        )
      );
  }

  async recalculateNewsCounts(newsId: string): Promise<void> {
    // Count likes and dislikes for this news
    const interactions = await db
      .select()
      .from(newsInteractions)
      .where(eq(newsInteractions.newsId, newsId));

    const likesCount = interactions.filter(i => i.interactionType === 'LIKE').length;
    const dislikesCount = interactions.filter(i => i.interactionType === 'DISLIKE').length;

    // Update the news table with new counts
    await db
      .update(news)
      .set({ 
        likesCount, 
        dislikesCount,
        updatedAt: new Date()
      })
      .where(eq(news.id, newsId));
  }

  // Player Ratings
  async createPlayerRating(insertRating: InsertPlayerRating): Promise<PlayerRating> {
    // Check if rating already exists
    const existing = await db
      .select()
      .from(playerRatings)
      .where(
        and(
          eq(playerRatings.userId, insertRating.userId),
          eq(playerRatings.playerId, insertRating.playerId),
          eq(playerRatings.matchId, insertRating.matchId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing rating
      const [updated] = await db
        .update(playerRatings)
        .set({ 
          rating: insertRating.rating,
          comment: insertRating.comment,
          updatedAt: new Date()
        })
        .where(eq(playerRatings.id, existing[0].id))
        .returning();
      return updated;
    }

    // Create new rating
    const [rating] = await db
      .insert(playerRatings)
      .values(insertRating)
      .returning();
    return rating;
  }

  async getPlayerRatings(playerId: string): Promise<PlayerRating[]> {
    return await db
      .select()
      .from(playerRatings)
      .where(eq(playerRatings.playerId, playerId))
      .orderBy(desc(playerRatings.createdAt));
  }

  async getPlayerAverageRating(playerId: string): Promise<number | null> {
    const ratings = await this.getPlayerRatings(playerId);
    if (ratings.length === 0) return null;
    
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / ratings.length;
  }

  // Badges
  async getAllBadges(): Promise<Badge[]> {
    return await db.select().from(badges);
  }

  async getUserBadges(userId: string): Promise<any[]> {
    const result = await db
      .select({
        id: userBadges.id,
        earnedAt: userBadges.earnedAt,
        badge: badges,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));
    
    return result;
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    // Check if user already has this badge
    const existing = await db
      .select()
      .from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const [userBadge] = await db
      .insert(userBadges)
      .values({ userId, badgeId })
      .returning();
    
    return userBadge;
  }

  async checkAndAwardBadges(userId: string): Promise<UserBadge[]> {
    const awarded: UserBadge[] = [];
    const allBadges = await this.getAllBadges();
    const userBadgesList = await this.getUserBadges(userId);
    const earnedBadgeIds = new Set(userBadgesList.map(ub => ub.badge.id));

    // Get user stats
    const ratingsCount = await db
      .select()
      .from(playerRatings)
      .where(eq(playerRatings.userId, userId));
    
    const interactionsCount = await db
      .select()
      .from(newsInteractions)
      .where(eq(newsInteractions.userId, userId));

    // Check each badge condition
    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let shouldAward = false;

      if (badge.condition === 'signup') {
        shouldAward = true;
      } else if (badge.condition === 'player_ratings') {
        shouldAward = ratingsCount.length >= badge.threshold;
      } else if (badge.condition === 'news_interactions') {
        shouldAward = interactionsCount.length >= badge.threshold;
      }

      if (shouldAward) {
        const userBadge = await this.awardBadge(userId, badge.id);
        awarded.push(userBadge);
      }
    }

    return awarded;
  }

  // Transfers
  async getTransfersByTeam(teamId: string, limit = 10): Promise<Transfer[]> {
    return await db
      .select()
      .from(transfers)
      .where(eq(transfers.teamId, teamId))
      .orderBy(desc(transfers.transferDate))
      .limit(limit);
  }

  async createTransfer(insertTransfer: InsertTransfer): Promise<Transfer> {
    const [transfer] = await db.insert(transfers).values(insertTransfer).returning();
    return transfer;
  }

  // Influencer Requests
  async createInfluencerRequest(insertRequest: InsertInfluencerRequest): Promise<InfluencerRequest> {
    const [request] = await db.insert(influencerRequests).values(insertRequest).returning();
    return request;
  }

  async getInfluencerRequestByUserId(userId: string): Promise<InfluencerRequest | undefined> {
    const [request] = await db
      .select()
      .from(influencerRequests)
      .where(eq(influencerRequests.userId, userId))
      .limit(1);
    return request || undefined;
  }

  async getAllInfluencerRequests(status?: string): Promise<(InfluencerRequest & { user: User })[]> {
    let query = db
      .select({
        id: influencerRequests.id,
        userId: influencerRequests.userId,
        reason: influencerRequests.reason,
        status: influencerRequests.status,
        reviewedBy: influencerRequests.reviewedBy,
        reviewedAt: influencerRequests.reviewedAt,
        createdAt: influencerRequests.createdAt,
        updatedAt: influencerRequests.updatedAt,
        user: users,
      })
      .from(influencerRequests)
      .innerJoin(users, eq(influencerRequests.userId, users.id))
      .orderBy(desc(influencerRequests.createdAt));

    if (status) {
      query = query.where(eq(influencerRequests.status, status)) as any;
    }

    const results = await query;
    return results.map((row: any) => ({
      id: row.id,
      userId: row.userId,
      reason: row.reason,
      status: row.status,
      reviewedBy: row.reviewedBy,
      reviewedAt: row.reviewedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: row.user,
    }));
  }

  async updateInfluencerRequestStatus(
    requestId: string,
    status: string,
    reviewedBy: string
  ): Promise<InfluencerRequest | undefined> {
    const [request] = await db
      .update(influencerRequests)
      .set({
        status,
        reviewedBy,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(influencerRequests.id, requestId))
      .returning();

    // Se aprovado, atualizar o status de influencer do usuário
    if (status === 'APPROVED' && request) {
      await this.updateUserInfluencerStatus(request.userId, true);
    }

    return request || undefined;
  }
}

export const storage = new DatabaseStorage();
