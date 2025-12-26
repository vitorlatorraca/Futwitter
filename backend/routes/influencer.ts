import type { Router } from "express";
import express from "express";
import { storage } from "../../server/storage";
import { insertInfluencerRequestSchema } from "@shared/schema";
import { requireAuth } from "../../server/auth/middleware";

export function createInfluencerRoutes(): Router {
  const router = express.Router();

  router.post('/request', requireAuth, async (req, res) => {
    try {
      const userId = String(req.user!.id);

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
      } as any);

      res.status(201).json(request);
    } catch (error: any) {
      console.error('Create influencer request error:', error);
      if (error.issues) {
        // Zod validation error
        return res.status(400).json({ message: 'Dados inválidos', errors: error.issues });
      }
      res.status(400).json({ message: error.message || 'Erro ao criar solicitação' });
    }
  });

  router.get('/request/my', requireAuth, async (req, res) => {
    try {
      const userId = String(req.user!.id);
      const request = await storage.getInfluencerRequestByUserId(userId);
      res.json(request || null);
    } catch (error: any) {
      console.error('Get my influencer request error:', error);
      res.status(500).json({ message: error.message || 'Erro ao buscar solicitação' });
    }
  });

  return router;
}

