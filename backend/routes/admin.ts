import type { Router } from "express";
import express from "express";
import { storage } from "../../server/storage";
import { requireAuth } from "../../server/auth/middleware";

// Middleware to check if user is an admin
async function requireAdmin(req: any, res: any, next: any) {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'Não autenticado' });
  }

  const user = await storage.getUser(String(req.user.id));
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  if (user.userType !== 'ADMIN') {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
  }
  next();
}

export function createAdminRoutes(): Router {
  const router = express.Router();

  router.get('/users', requireAuth, requireAdmin, async (req, res) => {
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

  router.put('/users/:id/influencer', requireAuth, requireAdmin, async (req, res) => {
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

  router.get('/influencer-requests', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      const requests = await storage.getAllInfluencerRequests(status as string);
      res.json(requests);
    } catch (error) {
      console.error('Get influencer requests error:', error);
      res.status(500).json({ message: 'Erro ao buscar solicitações' });
    }
  });

  router.put('/influencer-requests/:id/review', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const adminId = String(req.user!.id);

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

  return router;
}

