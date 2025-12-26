import type { Router } from "express";
import express from "express";
import { storage } from "../../server/storage";

export function createMatchesRoutes(): Router {
  const router = express.Router();

  router.get('/:teamId/recent', async (req, res) => {
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

  router.get('/:teamId/last-match', async (req, res) => {
    try {
      const { teamId } = req.params;
      const lastMatch = await storage.getLastMatch(teamId);
      
      if (!lastMatch) {
        return res.json(null);
      }

      // Add user ratings if logged in
      if (req.user?.id) {
        const playersWithUserRating = await Promise.all(
          lastMatch.players.map(async (player) => {
            const userRating = await storage.getPlayerRatingForMatch(
              player.id,
              lastMatch.id,
              String(req.user!.id)
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

  router.get('/:teamId/upcoming', async (req, res) => {
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


  return router;
}

