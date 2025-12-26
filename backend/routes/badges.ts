import type { Router } from "express";
import express from "express";
import { storage } from "../../server/storage";
import { requireAuth } from "../../server/auth/middleware";

export function createBadgesRoutes(): Router {
  const router = express.Router();

  router.get('/', requireAuth, async (req, res) => {
    try {
      const userId = String(req.user!.id);
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

  router.post('/check', requireAuth, async (req, res) => {
    try {
      const userId = String(req.user!.id);
      const newBadges = await storage.checkAndAwardBadges(userId);
      res.json(newBadges);
    } catch (error) {
      console.error('Check badges error:', error);
      res.status(500).json({ message: 'Erro ao verificar badges' });
    }
  });

  return router;
}

