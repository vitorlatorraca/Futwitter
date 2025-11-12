import { sql } from "drizzle-orm";
import { pgTable, varchar, text, timestamp, integer, boolean, real, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// ENUMS
// ============================================

export const userTypeEnum = pgEnum("user_type", ["FAN", "JOURNALIST", "ADMIN"]);
export const playerPositionEnum = pgEnum("player_position", ["GOALKEEPER", "DEFENDER", "MIDFIELDER", "FORWARD"]);
export const newsCategoryEnum = pgEnum("news_category", ["NEWS", "ANALYSIS", "BACKSTAGE", "MARKET"]);
export const interactionTypeEnum = pgEnum("interaction_type", ["LIKE", "DISLIKE"]);
export const journalistStatusEnum = pgEnum("journalist_status", ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]);

// ============================================
// TABLES
// ============================================

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  password: text("password").notNull(),
  userType: userTypeEnum("user_type").notNull().default("FAN"),
  teamId: varchar("team_id", { length: 36 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const journalists = pgTable("journalists", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().unique(),
  organization: varchar("organization", { length: 255 }).notNull(),
  professionalId: varchar("professional_id", { length: 100 }).notNull(),
  portfolioUrl: text("portfolio_url"),
  status: journalistStatusEnum("status").notNull().default("PENDING"),
  verificationDate: timestamp("verification_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const teams = pgTable("teams", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull().unique(),
  shortName: varchar("short_name", { length: 10 }).notNull(),
  logoUrl: text("logo_url").notNull(),
  primaryColor: varchar("primary_color", { length: 7 }).notNull(),
  secondaryColor: varchar("secondary_color", { length: 7 }).notNull(),
  currentPosition: integer("current_position"),
  points: integer("points").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  draws: integer("draws").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  goalsFor: integer("goals_for").notNull().default(0),
  goalsAgainst: integer("goals_against").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const players = pgTable("players", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id", { length: 36 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  photoUrl: text("photo_url"),
  position: playerPositionEnum("position").notNull(),
  jerseyNumber: integer("jersey_number").notNull(),
  birthDate: timestamp("birth_date"),
  nationality: varchar("nationality", { length: 100 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const matches = pgTable("matches", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id", { length: 36 }).notNull(),
  opponent: varchar("opponent", { length: 255 }).notNull(),
  opponentLogoUrl: text("opponent_logo_url"),
  isHomeMatch: boolean("is_home_match").notNull(),
  teamScore: integer("team_score"),
  opponentScore: integer("opponent_score"),
  matchDate: timestamp("match_date").notNull(),
  stadium: varchar("stadium", { length: 255 }),
  championshipRound: integer("championship_round"),
  status: varchar("status", { length: 50 }).notNull().default("SCHEDULED"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const matchPlayers = pgTable("match_players", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id", { length: 36 }).notNull(),
  playerId: varchar("player_id", { length: 36 }).notNull(),
  participated: boolean("participated").notNull().default(true),
  wasStarter: boolean("was_starter").notNull().default(false),
  minutesPlayed: integer("minutes_played"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const news = pgTable("news", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  journalistId: varchar("journalist_id", { length: 36 }).notNull(),
  teamId: varchar("team_id", { length: 36 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  category: newsCategoryEnum("category").notNull().default("NEWS"),
  likesCount: integer("likes_count").notNull().default(0),
  dislikesCount: integer("dislikes_count").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const newsInteractions = pgTable("news_interactions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull(),
  newsId: varchar("news_id", { length: 36 }).notNull(),
  interactionType: interactionTypeEnum("interaction_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const playerRatings = pgTable("player_ratings", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull(),
  playerId: varchar("player_id", { length: 36 }).notNull(),
  matchId: varchar("match_id", { length: 36 }).notNull(),
  rating: real("rating").notNull(),
  comment: varchar("comment", { length: 200 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull(),
  content: text("content").notNull(),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const badges = pgTable("badges", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 10 }).notNull(),
  condition: varchar("condition", { length: 100 }).notNull(),
  threshold: integer("threshold").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull(),
  badgeId: varchar("badge_id", { length: 36 }).notNull(),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
});

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ one, many }) => ({
  team: one(teams, {
    fields: [users.teamId],
    references: [teams.id],
  }),
  journalist: one(journalists, {
    fields: [users.id],
    references: [journalists.userId],
  }),
  newsInteractions: many(newsInteractions),
  playerRatings: many(playerRatings),
  comments: many(comments),
  userBadges: many(userBadges),
}));

export const journalistsRelations = relations(journalists, ({ one, many }) => ({
  user: one(users, {
    fields: [journalists.userId],
    references: [users.id],
  }),
  news: many(news),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  users: many(users),
  players: many(players),
  news: many(news),
  matches: many(matches),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  team: one(teams, {
    fields: [players.teamId],
    references: [teams.id],
  }),
  ratings: many(playerRatings),
  matchParticipations: many(matchPlayers),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  team: one(teams, {
    fields: [matches.teamId],
    references: [teams.id],
  }),
  playerParticipations: many(matchPlayers),
  playerRatings: many(playerRatings),
}));

export const matchPlayersRelations = relations(matchPlayers, ({ one }) => ({
  match: one(matches, {
    fields: [matchPlayers.matchId],
    references: [matches.id],
  }),
  player: one(players, {
    fields: [matchPlayers.playerId],
    references: [players.id],
  }),
}));

export const newsRelations = relations(news, ({ one, many }) => ({
  journalist: one(journalists, {
    fields: [news.journalistId],
    references: [journalists.id],
  }),
  team: one(teams, {
    fields: [news.teamId],
    references: [teams.id],
  }),
  interactions: many(newsInteractions),
}));

export const newsInteractionsRelations = relations(newsInteractions, ({ one }) => ({
  user: one(users, {
    fields: [newsInteractions.userId],
    references: [users.id],
  }),
  news: one(news, {
    fields: [newsInteractions.newsId],
    references: [news.id],
  }),
}));

export const playerRatingsRelations = relations(playerRatings, ({ one }) => ({
  user: one(users, {
    fields: [playerRatings.userId],
    references: [users.id],
  }),
  player: one(players, {
    fields: [playerRatings.playerId],
    references: [players.id],
  }),
  match: one(matches, {
    fields: [playerRatings.matchId],
    references: [matches.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

// ============================================
// SCHEMAS FOR VALIDATION
// ============================================

// User schemas
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Email inválido"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectUserSchema = createSelectSchema(users);

// Journalist schemas
export const insertJournalistSchema = createInsertSchema(journalists, {
  organization: z.string().min(2, "Organização deve ter pelo menos 2 caracteres"),
  professionalId: z.string().min(2, "ID profissional é obrigatório"),
}).omit({ id: true, createdAt: true, updatedAt: true, status: true, verificationDate: true });

export const selectJournalistSchema = createSelectSchema(journalists);

// Team schemas
export const insertTeamSchema = createInsertSchema(teams).omit({ id: true, createdAt: true, updatedAt: true });
export const selectTeamSchema = createSelectSchema(teams);

// Player schemas
export const insertPlayerSchema = createInsertSchema(players).omit({ id: true, createdAt: true, updatedAt: true });
export const selectPlayerSchema = createSelectSchema(players);

// Match schemas
export const insertMatchSchema = createInsertSchema(matches).omit({ id: true, createdAt: true, updatedAt: true });
export const selectMatchSchema = createSelectSchema(matches);

// News schemas
export const insertNewsSchema = createInsertSchema(news, {
  title: z.string().min(10, "Título deve ter pelo menos 10 caracteres").max(200, "Título não pode ter mais de 200 caracteres"),
  content: z.string().min(50, "Conteúdo deve ter pelo menos 50 caracteres").max(1000, "Conteúdo não pode ter mais de 1000 caracteres"),
}).omit({ id: true, journalistId: true, createdAt: true, updatedAt: true, likesCount: true, dislikesCount: true, publishedAt: true });

export const selectNewsSchema = createSelectSchema(news);

// News interaction schemas
export const insertNewsInteractionSchema = createInsertSchema(newsInteractions).omit({ id: true, createdAt: true, updatedAt: true });
export const selectNewsInteractionSchema = createSelectSchema(newsInteractions);

// Player rating schemas
export const insertPlayerRatingSchema = createInsertSchema(playerRatings, {
  rating: z.number().min(0, "Nota mínima é 0").max(10, "Nota máxima é 10"),
  comment: z.string().max(200, "Comentário não pode ter mais de 200 caracteres").optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectPlayerRatingSchema = createSelectSchema(playerRatings);

// Badge schemas
export const insertBadgeSchema = createInsertSchema(badges).omit({ id: true, createdAt: true });
export const selectBadgeSchema = createSelectSchema(badges);

// User badge schemas
export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({ id: true, earnedAt: true });
export const selectUserBadgeSchema = createSelectSchema(userBadges);

// ============================================
// TYPES
// ============================================

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Journalist = typeof journalists.$inferSelect;
export type InsertJournalist = z.infer<typeof insertJournalistSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;

export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;

export type NewsInteraction = typeof newsInteractions.$inferSelect;
export type InsertNewsInteraction = z.infer<typeof insertNewsInteractionSchema>;

export type PlayerRating = typeof playerRatings.$inferSelect;
export type InsertPlayerRating = z.infer<typeof insertPlayerRatingSchema>;

export type Comment = typeof comments.$inferSelect;

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
