import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
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
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

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
  getAllNews(teamId?: string): Promise<any[]>;
  getNewsByJournalist(journalistId: string): Promise<News[]>;
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

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
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

  // News
  async getAllNews(teamId?: string): Promise<any[]> {
    let query = db
      .select({
        id: news.id,
        journalistId: news.journalistId,
        teamId: news.teamId,
        title: news.title,
        content: news.content,
        imageUrl: news.imageUrl,
        category: news.category,
        likesCount: news.likesCount,
        dislikesCount: news.dislikesCount,
        isPublished: news.isPublished,
        publishedAt: news.publishedAt,
        createdAt: news.createdAt,
        updatedAt: news.updatedAt,
        team: teams,
        journalist: {
          id: journalists.id,
          user: {
            name: users.name,
          },
        },
      })
      .from(news)
      .innerJoin(teams, eq(news.teamId, teams.id))
      .innerJoin(journalists, eq(news.journalistId, journalists.id))
      .innerJoin(users, eq(journalists.userId, users.id))
      .where(eq(news.isPublished, true))
      .orderBy(desc(news.publishedAt));

    if (teamId) {
      query = query.where(eq(news.teamId, teamId)) as any;
    }

    return await query;
  }

  async getNewsByJournalist(journalistId: string): Promise<News[]> {
    return await db
      .select()
      .from(news)
      .where(eq(news.journalistId, journalistId))
      .orderBy(desc(news.publishedAt));
  }

  async createNews(insertNews: InsertNews): Promise<News> {
    const [newsItem] = await db.insert(news).values(insertNews).returning();
    return newsItem;
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
}

export const storage = new DatabaseStorage();
