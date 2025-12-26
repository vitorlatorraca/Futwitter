import type { Express } from "express";
import { createAuthRoutes } from "./auth";
import { createTeamsRoutes } from "./teams";
import { createMatchesRoutes } from "./matches";
import { createNewsRoutes } from "./news";
import { createProfileRoutes } from "./profile";
import { createAdminRoutes } from "./admin";
import { createInfluencerRoutes } from "./influencer";
import { createBadgesRoutes } from "./badges";
import { createPlayersRoutes } from "./players";
import { authenticateOptional } from "../../server/auth/middleware";
import { storage } from "../../server/storage";

export function registerRoutes(app: Express): void {
  // Apply optional authentication middleware globally to parse cookies
  app.use(authenticateOptional);

  // Mount all routes under /api
  app.use('/api/auth', createAuthRoutes());
  app.use('/api/teams', createTeamsRoutes());
  app.use('/api/matches', createMatchesRoutes());
  app.use('/api/news', createNewsRoutes());
  app.use('/api/profile', createProfileRoutes());
  app.use('/api/admin', createAdminRoutes());
  app.use('/api/influencer', createInfluencerRoutes());
  app.use('/api/badges', createBadgesRoutes());
  app.use('/api/players', createPlayersRoutes());

  // Standings endpoint
  app.get('/api/standings', async (req, res) => {
    try {
      const standings = await storage.getStandings();
      res.json(standings);
    } catch (error) {
      console.error('Get standings error:', error);
      res.status(500).json({ message: 'Erro ao buscar classificação' });
    }
  });
}

