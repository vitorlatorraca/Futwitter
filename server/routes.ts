import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { sessionPool } from "./db";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { insertUserSchema, insertNewsSchema, insertPlayerRatingSchema, insertInfluencerRequestSchema } from "@shared/schema";

const PgSession = ConnectPgSimple(session);

// Middleware to check if user is authenticated
function requireAuth(req: any, res: any, next: any) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Não autenticado' });
  }
  next();
}

// Middleware to check if user is a journalist or influencer
async function requireJournalistOrInfluencer(req: any, res: any, next: any) {
  if (req.session.userType === 'JOURNALIST') {
    return next();
  }
  
  // Check if user is an influencer
  if (req.session.userId) {
    const user = await storage.getUser(req.session.userId);
    if (user?.isInfluencer) {
      return next();
    }
  }
  
  return res.status(403).json({ message: 'Acesso negado. Apenas jornalistas ou influencers.' });
}

// Middleware to check if user is an admin
function requireAdmin(req: any, res: any, next: any) {
  if (req.session.userType !== 'ADMIN') {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  app.use(
    session({
      store: new PgSession({
        pool: sessionPool,
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
        sameSite: 'lax',
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

      res.json({ id: user.id, name: user.name, email: user.email, teamId: user.teamId, userType: user.userType, isInfluencer: user.isInfluencer });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ message: error.message || 'Erro ao criar conta' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
      }

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

      res.json({ id: user.id, name: user.name, email: user.email, teamId: user.teamId, userType: user.userType, isInfluencer: user.isInfluencer });
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: error.message || 'Erro ao fazer login' });
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

      res.json({ id: user.id, name: user.name, email: user.email, teamId: user.teamId, userType: user.userType, isInfluencer: user.isInfluencer });
    } catch (error: any) {
      console.error('Get me error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: error.message || 'Erro ao buscar usuário' });
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

  app.get('/api/teams/:teamId/last-match', async (req, res) => {
    try {
      const { teamId } = req.params;
      const lastMatch = await storage.getLastMatch(teamId);
      
      if (!lastMatch) {
        return res.json(null);
      }

      // Add user ratings if logged in
      if (req.session.userId) {
        const playersWithUserRating = await Promise.all(
          lastMatch.players.map(async (player) => {
            const userRating = await storage.getPlayerRatingForMatch(
              player.id,
              lastMatch.id,
              req.session.userId!
            );
            return {
              ...player,
              userRating: userRating?.rating || null,
            };
          })
        );
        res.json({ ...lastMatch, players: playersWithUserRating });
      } else {
        res.json(lastMatch);
      }
    } catch (error) {
      console.error('Get last match error:', error);
      res.status(500).json({ message: 'Erro ao buscar último jogo' });
    }
  });

  app.get('/api/teams/:teamId/upcoming', async (req, res) => {
    try {
      const { teamId } = req.params;
      const limit = parseInt(req.query.limit as string) || 3;
      const upcoming = await storage.getUpcomingMatches(teamId, limit);
      res.json(upcoming);
    } catch (error) {
      console.error('Get upcoming matches error:', error);
      res.status(500).json({ message: 'Erro ao buscar próximos jogos' });
    }
  });

  app.get('/api/standings', async (req, res) => {
    try {
      const standings = await storage.getStandings();
      res.json(standings);
    } catch (error) {
      console.error('Get standings error:', error);
      res.status(500).json({ message: 'Erro ao buscar classificação' });
    }
  });

  app.get('/api/teams/:teamId/transfers', async (req, res) => {
    try {
      const { teamId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const transfers = await storage.getTransfersByTeam(teamId, limit);
      res.json(transfers);
    } catch (error) {
      console.error('Get transfers error:', error);
      res.status(500).json({ message: 'Erro ao buscar transferências' });
    }
  });

  // ============================================
  // NEWS ROUTES
  // ============================================

  app.get('/api/news', async (req, res) => {
    try {
      const { teamId, filter } = req.query;
      
      console.log(`[GET /api/news] Request received - filter: ${filter}, teamId: ${teamId}, sessionUserId: ${req.session.userId}`);
      
      let filterTeamId: string | undefined;
      
      if (filter === 'my-team' && req.session.userId) {
        const user = await storage.getUser(req.session.userId);
        filterTeamId = user?.teamId || undefined;
        console.log(`[GET /api/news] my-team filter - user teamId: ${user?.teamId}`);
      } else if (filter === 'all') {
        filterTeamId = undefined;
        console.log(`[GET /api/news] all filter - no teamId filter`);
      } else if (teamId) {
        filterTeamId = teamId as string;
        console.log(`[GET /api/news] specific team filter - teamId: ${teamId}`);
      }

      // Paginação
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const newsItems = await storage.getAllNews(filterTeamId, limit, offset);

      if (process.env.NODE_ENV === 'development') {
        console.log(`[GET /api/news] Filter: ${filter}, teamId: ${filterTeamId}, Found ${newsItems.length} items (limit: ${limit}, offset: ${offset})`);
      }

      // Add user interaction info if logged in
      if (req.session.userId) {
        for (const newsItem of newsItems) {
          const interaction = await storage.getUserNewsInteraction(req.session.userId, newsItem.id);
          (newsItem as any).userInteraction = interaction?.interactionType || null;
        }
      }

      res.json(newsItems);
    } catch (error: any) {
      console.error('Get news error:', error);
      console.error('Error stack:', error?.stack);
      console.error('Error message:', error?.message);
      res.status(500).json({ 
        message: 'Erro ao buscar notícias',
        error: process.env.NODE_ENV === 'development' ? error?.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      });
    }
  });

  app.get('/api/news/my-news', requireAuth, requireJournalistOrInfluencer, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      let newsItems: any[] = [];

      // Se for jornalista, buscar notícias por journalistId
      if (user.userType === 'JOURNALIST') {
        const journalist = await storage.getJournalist(userId);
        if (journalist) {
          newsItems = await storage.getNewsByJournalist(journalist.id);
        }
      }

      // Se for influencer, buscar notícias por userId
      if (user.isInfluencer) {
        const influencerNews = await storage.getNewsByUser(userId);
        newsItems = [...newsItems, ...influencerNews];
      }

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

  app.post('/api/news', requireAuth, requireJournalistOrInfluencer, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      const newsData = insertNewsSchema.parse(req.body);

      // Se for influencer, garantir que está postando apenas para o time dele
      if (user.isInfluencer && user.userType !== 'JOURNALIST') {
        if (newsData.teamId !== user.teamId) {
          return res.status(403).json({ message: 'Influencers só podem postar notícias para o seu próprio time' });
        }
        // Criar notícia com userId
        console.log(`[POST /api/news] Creating influencer news - userId: ${user.id}, teamId: ${user.teamId}, title: ${newsData.title}`);
        const newsItem = await storage.createNews({
          ...newsData,
          userId: user.id,
          teamId: user.teamId!, // Forçar o time do influencer
        });
        console.log(`[POST /api/news] News created successfully - id: ${newsItem.id}, teamId: ${newsItem.teamId}`);
        return res.status(201).json(newsItem);
      }

      // Se for jornalista, usar journalistId
      const journalist = await storage.getJournalist(userId);
      if (!journalist) {
        return res.status(404).json({ message: 'Jornalista não encontrado' });
      }

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

  app.delete('/api/news/:id', requireAuth, requireJournalistOrInfluencer, async (req, res) => {
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

  app.put('/api/profile/avatar', requireAuth, async (req, res) => {
    try {
      const { avatarUrl } = req.body;
      const userId = req.session.userId!;

      if (!avatarUrl || typeof avatarUrl !== 'string') {
        return res.status(400).json({ message: 'URL do avatar é obrigatória' });
      }

      // Validate URL format (base64 data URL or http/https URL)
      const isBase64 = avatarUrl.startsWith('data:image/');
      const isHttpUrl = avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://');
      
      if (!isBase64 && !isHttpUrl) {
        return res.status(400).json({ message: 'Formato de URL inválido' });
      }

      // Validate base64 image size (max 2MB)
      if (isBase64) {
        const base64Data = avatarUrl.split(',')[1];
        const sizeInBytes = (base64Data.length * 3) / 4;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        
        if (sizeInMB > 2) {
          return res.status(400).json({ message: 'Imagem muito grande. Tamanho máximo: 2MB' });
        }
      }

      const updatedUser = await storage.updateUser(userId, { avatarUrl });

      if (!updatedUser) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error('Update avatar error:', error);
      res.status(500).json({ message: 'Erro ao atualizar avatar' });
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

  // ============================================
  // ADMIN ROUTES
  // ============================================

  app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      // Remove senhas dos usuários antes de retornar
      const usersWithoutPasswords = allUsers.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
  });

  app.put('/api/admin/users/:id/influencer', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isInfluencer } = req.body;

      if (typeof isInfluencer !== 'boolean') {
        return res.status(400).json({ message: 'isInfluencer deve ser um booleano' });
      }

      const updatedUser = await storage.updateUserInfluencerStatus(id, isInfluencer);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Remove senha antes de retornar
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Update influencer status error:', error);
      res.status(500).json({ message: 'Erro ao atualizar status de influencer' });
    }
  });

  // ============================================
  // INFLUENCER REQUEST ROUTES
  // ============================================

  app.post('/api/influencer/request', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const requestData = insertInfluencerRequestSchema.parse(req.body);

      // Verificar se já existe uma solicitação
      const existingRequest = await storage.getInfluencerRequestByUserId(userId);
      if (existingRequest) {
        if (existingRequest.status === 'PENDING') {
          return res.status(400).json({ message: 'Você já possui uma solicitação pendente' });
        }
        if (existingRequest.status === 'APPROVED') {
          return res.status(400).json({ message: 'Você já é um influencer' });
        }
      }

      const request = await storage.createInfluencerRequest({
        ...requestData,
        userId,
      });

      res.status(201).json(request);
    } catch (error: any) {
      console.error('Create influencer request error:', error);
      res.status(400).json({ message: error.message || 'Erro ao criar solicitação' });
    }
  });

  app.get('/api/influencer/request/my', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const request = await storage.getInfluencerRequestByUserId(userId);
      res.json(request || null);
    } catch (error) {
      console.error('Get my influencer request error:', error);
      res.status(500).json({ message: 'Erro ao buscar solicitação' });
    }
  });

  app.get('/api/admin/influencer-requests', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      const requests = await storage.getAllInfluencerRequests(status as string);
      res.json(requests);
    } catch (error) {
      console.error('Get influencer requests error:', error);
      res.status(500).json({ message: 'Erro ao buscar solicitações' });
    }
  });

  app.put('/api/admin/influencer-requests/:id/review', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const adminId = req.session.userId!;

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ message: 'Status inválido. Use APPROVED ou REJECTED' });
      }

      const updatedRequest = await storage.updateInfluencerRequestStatus(id, status, adminId);
      
      if (!updatedRequest) {
        return res.status(404).json({ message: 'Solicitação não encontrada' });
      }

      res.json(updatedRequest);
    } catch (error) {
      console.error('Review influencer request error:', error);
      res.status(500).json({ message: 'Erro ao revisar solicitação' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
