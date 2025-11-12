import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { insertUserSchema, insertNewsSchema, insertPlayerRatingSchema } from "@shared/schema";

const PgSession = ConnectPgSimple(session);

// Middleware to check if user is authenticated
function requireAuth(req: any, res: any, next: any) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Não autenticado' });
  }
  next();
}

// Middleware to check if user is a journalist
function requireJournalist(req: any, res: any, next: any) {
  if (req.session.userType !== 'JOURNALIST') {
    return res.status(403).json({ message: 'Acesso negado. Apenas jornalistas.' });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: 'user_sessions',
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || 'brasileirao-secret-key-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      },
    })
  );

  // ============================================
  // AUTHENTICATION ROUTES
  // ============================================

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, teamId } = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        teamId: teamId || null,
        userType: 'FAN',
      });

      // Set session
      req.session.userId = user.id;
      req.session.userType = user.userType;

      // Award signup badge
      await storage.checkAndAwardBadges(user.id);

      res.json({ id: user.id, name: user.name, email: user.email, teamId: user.teamId, userType: user.userType });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ message: error.message || 'Erro ao criar conta' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Email ou senha incorretos' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Email ou senha incorretos' });
      }

      // Set session
      req.session.userId = user.id;
      req.session.userType = user.userType;

      res.json({ id: user.id, name: user.name, email: user.email, teamId: user.teamId, userType: user.userType });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Erro ao fazer login' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao fazer logout' });
      }
      res.json({ message: 'Logout realizado com sucesso' });
    });
  });

  app.get('/api/auth/me', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      res.json({ id: user.id, name: user.name, email: user.email, teamId: user.teamId, userType: user.userType });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
  });

  // ============================================
  // TEAMS ROUTES
  // ============================================

  app.get('/api/teams', async (req, res) => {
    try {
      const teams = await storage.getAllTeams();
      res.json(teams);
    } catch (error) {
      console.error('Get teams error:', error);
      res.status(500).json({ message: 'Erro ao buscar times' });
    }
  });

  app.get('/api/teams/:id', async (req, res) => {
    try {
      const team = await storage.getTeam(req.params.id);
      if (!team) {
        return res.status(404).json({ message: 'Time não encontrado' });
      }

      const players = await storage.getPlayersByTeam(req.params.id);

      res.json({ ...team, players });
    } catch (error) {
      console.error('Get team error:', error);
      res.status(500).json({ message: 'Erro ao buscar time' });
    }
  });

  // ============================================
  // MATCHES ROUTES
  // ============================================

  app.get('/api/matches/:teamId/recent', async (req, res) => {
    try {
      const { teamId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      const matches = await storage.getMatchesByTeam(teamId, limit);

      res.json(matches);
    } catch (error) {
      console.error('Get recent matches error:', error);
      res.status(500).json({ message: 'Erro ao buscar partidas' });
    }
  });

  // ============================================
  // NEWS ROUTES
  // ============================================

  app.get('/api/news', async (req, res) => {
    try {
      const { teamId, filter } = req.query;
      
      let filterTeamId: string | undefined;
      
      if (filter === 'my-team' && req.session.userId) {
        const user = await storage.getUser(req.session.userId);
        filterTeamId = user?.teamId || undefined;
      } else if (filter === 'all') {
        filterTeamId = undefined;
      } else if (teamId) {
        filterTeamId = teamId as string;
      }

      const newsItems = await storage.getAllNews(filterTeamId);

      // Add user interaction info if logged in
      if (req.session.userId) {
        for (const newsItem of newsItems) {
          const interaction = await storage.getUserNewsInteraction(req.session.userId, newsItem.id);
          (newsItem as any).userInteraction = interaction?.interactionType || null;
        }
      }

      res.json(newsItems);
    } catch (error) {
      console.error('Get news error:', error);
      res.status(500).json({ message: 'Erro ao buscar notícias' });
    }
  });

  app.get('/api/news/my-news', requireAuth, requireJournalist, async (req, res) => {
    try {
      const journalist = await storage.getJournalist(req.session.userId!);
      if (!journalist) {
        return res.status(404).json({ message: 'Jornalista não encontrado' });
      }

      const newsItems = await storage.getNewsByJournalist(journalist.id);

      // Enrich with team data
      const enrichedNews = await Promise.all(
        newsItems.map(async (newsItem) => {
          const team = await storage.getTeam(newsItem.teamId);
          return { ...newsItem, team };
        })
      );

      res.json(enrichedNews);
    } catch (error) {
      console.error('Get my news error:', error);
      res.status(500).json({ message: 'Erro ao buscar suas notícias' });
    }
  });

  app.post('/api/news', requireAuth, requireJournalist, async (req, res) => {
    try {
      const journalist = await storage.getJournalist(req.session.userId!);
      if (!journalist) {
        return res.status(404).json({ message: 'Jornalista não encontrado' });
      }

      const newsData = insertNewsSchema.parse(req.body);

      const newsItem = await storage.createNews({
        ...newsData,
        journalistId: journalist.id,
      });

      res.status(201).json(newsItem);
    } catch (error: any) {
      console.error('Create news error:', error);
      res.status(400).json({ message: error.message || 'Erro ao criar notícia' });
    }
  });

  app.delete('/api/news/:id', requireAuth, requireJournalist, async (req, res) => {
    try {
      await storage.deleteNews(req.params.id);
      res.json({ message: 'Notícia excluída com sucesso' });
    } catch (error) {
      console.error('Delete news error:', error);
      res.status(500).json({ message: 'Erro ao excluir notícia' });
    }
  });

  // ============================================
  // NEWS INTERACTIONS ROUTES
  // ============================================

  app.post('/api/news/:id/interaction', requireAuth, async (req, res) => {
    try {
      const { type } = req.body;
      const newsId = req.params.id;
      const userId = req.session.userId!;

      // Check if interaction already exists
      const existing = await storage.getUserNewsInteraction(userId, newsId);

      if (existing) {
        if (existing.interactionType === type) {
          // Remove interaction if same type
          await storage.deleteNewsInteraction(userId, newsId);
          // Recalculate counts
          await storage.recalculateNewsCounts(newsId);
          return res.json({ message: 'Interação removida' });
        } else {
          // Delete old interaction before creating new one
          await storage.deleteNewsInteraction(userId, newsId);
        }
      }

      // Create new interaction
      const interaction = await storage.createNewsInteraction({
        userId,
        newsId,
        interactionType: type,
      });

      // Recalculate counts
      await storage.recalculateNewsCounts(newsId);

      // Check for new badges
      await storage.checkAndAwardBadges(userId);

      res.status(201).json(interaction);
    } catch (error) {
      console.error('Create interaction error:', error);
      res.status(500).json({ message: 'Erro ao registrar interação' });
    }
  });

  // ============================================
  // PLAYER RATINGS ROUTES
  // ============================================

  app.post('/api/players/:id/ratings', requireAuth, async (req, res) => {
    try {
      const playerId = req.params.id;
      const userId = req.session.userId!;
      const ratingData = insertPlayerRatingSchema.parse(req.body);

      const rating = await storage.createPlayerRating({
        ...ratingData,
        playerId,
        userId,
      });

      // Check for new badges
      await storage.checkAndAwardBadges(userId);

      res.status(201).json(rating);
    } catch (error: any) {
      console.error('Create rating error:', error);
      res.status(400).json({ message: error.message || 'Erro ao criar avaliação' });
    }
  });

  app.get('/api/players/:id/ratings', async (req, res) => {
    try {
      const ratings = await storage.getPlayerRatings(req.params.id);
      const average = await storage.getPlayerAverageRating(req.params.id);

      res.json({ ratings, average });
    } catch (error) {
      console.error('Get ratings error:', error);
      res.status(500).json({ message: 'Erro ao buscar avaliações' });
    }
  });

  // ============================================
  // PROFILE ROUTES
  // ============================================

  app.put('/api/profile', requireAuth, async (req, res) => {
    try {
      const { name, email } = req.body;
      const userId = req.session.userId!;

      const updatedUser = await storage.updateUser(userId, { name, email });

      res.json(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Erro ao atualizar perfil' });
    }
  });

  app.put('/api/profile/password', requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.session.userId!;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Senha atual incorreta' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(userId, { password: hashedPassword });

      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Erro ao alterar senha' });
    }
  });

  // ============================================
  // BADGE ROUTES
  // ============================================

  app.get('/api/badges', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const userBadges = await storage.getUserBadges(userId);
      const allBadges = await storage.getAllBadges();

      const badgesWithStatus = allBadges.map(badge => {
        const userBadge = userBadges.find(ub => ub.badge.id === badge.id);
        return {
          ...badge,
          unlocked: !!userBadge,
          earnedAt: userBadge?.earnedAt || null,
        };
      });

      res.json(badgesWithStatus);
    } catch (error) {
      console.error('Get badges error:', error);
      res.status(500).json({ message: 'Erro ao buscar badges' });
    }
  });

  app.post('/api/badges/check', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const newBadges = await storage.checkAndAwardBadges(userId);
      res.json(newBadges);
    } catch (error) {
      console.error('Check badges error:', error);
      res.status(500).json({ message: 'Erro ao verificar badges' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
