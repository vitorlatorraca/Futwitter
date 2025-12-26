import type { Router } from "express";
import express from "express";
import { storage } from "../../server/storage";
import bcrypt from "bcrypt";
import { requireAuth } from "../../server/auth/middleware";

export function createProfileRoutes(): Router {
  const router = express.Router();

  router.put('/', requireAuth, async (req, res) => {
    try {
      const { name, email } = req.body;
      const userId = String(req.user!.id);

      const updatedUser = await storage.updateUser(userId, { name, email });

      res.json(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Erro ao atualizar perfil' });
    }
  });

  router.put('/password', requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = String(req.user!.id);

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

  router.put('/avatar', requireAuth, async (req, res) => {
    try {
      const { avatarUrl } = req.body;
      const userId = String(req.user!.id);

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

  return router;
}

