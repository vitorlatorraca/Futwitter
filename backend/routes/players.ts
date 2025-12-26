import type { Router } from "express";
import express from "express";
import { storage } from "../../server/storage";
import { insertPlayerRatingSchema } from "@shared/schema";
import { requireAuth } from "../../server/auth/middleware";

export function createPlayersRoutes(): Router {
  const router = express.Router();

  router.post('/:id/ratings', requireAuth, async (req, res) => {
    try {
      const playerId = req.params.id;
      const userId = String(req.user!.id);
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

  router.get('/:id/ratings', async (req, res) => {
    try {
      const ratings = await storage.getPlayerRatings(req.params.id);
      const average = await storage.getPlayerAverageRating(req.params.id);

      res.json({ ratings, average });
    } catch (error) {
      console.error('Get ratings error:', error);
      res.status(500).json({ message: 'Erro ao buscar avaliações' });
    }
  });

  return router;
}

