import type { Router } from "express";
import express from "express";
import { storage } from "../../server/storage";

export function createTeamsRoutes(): Router {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const teams = await storage.getAllTeams();
      res.json(teams);
    } catch (error) {
      console.error('Get teams error:', error);
      res.status(500).json({ message: 'Erro ao buscar times' });
    }
  });

  router.get('/:id', async (req, res) => {
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

  router.get('/:teamId/transfers', async (req, res) => {
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

  return router;
}

