import type { Router } from "express";
import express from "express";
import { storage } from "../../server/storage";
import { insertNewsSchema } from "@shared/schema";
import { requireAuth } from "../../server/auth/middleware";

// Middleware to check if user is a journalist or influencer
async function requireJournalistOrInfluencer(req: any, res: any, next: any) {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'Não autenticado' });
  }

  const user = await storage.getUser(String(req.user.id));
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  if (user.userType === 'JOURNALIST' || user.isInfluencer) {
    return next();
  }
  
  return res.status(403).json({ message: 'Acesso negado. Apenas jornalistas ou influencers.' });
}

export function createNewsRoutes(): Router {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const { teamId, filter } = req.query;
      
      console.log(`[GET /api/news] Request received - filter: ${filter}, teamId: ${teamId}, userId: ${req.user?.id}`);
      
      let filterTeamId: string | undefined;
      
      if (filter === 'my-team' && req.user?.id) {
        const user = await storage.getUser(String(req.user.id));
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
      if (req.user?.id) {
        for (const newsItem of newsItems) {
          const interaction = await storage.getUserNewsInteraction(String(req.user.id), newsItem.id);
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

  router.get('/my-news', requireAuth, requireJournalistOrInfluencer, async (req, res) => {
    try {
      const userId = String(req.user!.id);
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

  router.post('/', requireAuth, requireJournalistOrInfluencer, async (req, res) => {
    try {
      const userId = String(req.user!.id);
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

  router.delete('/:id', requireAuth, requireJournalistOrInfluencer, async (req, res) => {
    try {
      await storage.deleteNews(req.params.id);
      res.json({ message: 'Notícia excluída com sucesso' });
    } catch (error) {
      console.error('Delete news error:', error);
      res.status(500).json({ message: 'Erro ao excluir notícia' });
    }
  });

  router.post('/:id/interaction', requireAuth, async (req, res) => {
    try {
      const { type } = req.body;
      const newsId = req.params.id;
      const userId = String(req.user!.id);

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

  return router;
}

