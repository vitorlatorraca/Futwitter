import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../_lib/db-helpers';
import { requireAuth } from '../../_lib/auth-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    return requireAuth(async (authReq, authRes) => {
        try {
            const { type } = authReq.body;
            const { newsId } = authReq.query;
            const auth = authReq.auth!;

            if (!newsId || typeof newsId !== 'string') {
                return authRes.status(400).json({ message: 'News ID é obrigatório' });
            }

            if (!type || (type !== 'LIKE' && type !== 'DISLIKE')) {
                return authRes.status(400).json({ message: 'Tipo de interação inválido' });
            }

            // Check if interaction already exists
            const existing = await storage.getUserNewsInteraction(auth.userId, newsId);

            if (existing) {
                if (existing.interactionType === type) {
                    // Remove interaction if same type
                    await storage.deleteNewsInteraction(auth.userId, newsId);
                    await storage.recalculateNewsCounts(newsId);
                    return authRes.status(200).json({ message: 'Interação removida' });
                } else {
                    // Delete old interaction before creating new one
                    await storage.deleteNewsInteraction(auth.userId, newsId);
                }
            }

            // Create new interaction
            const interaction = await storage.createNewsInteraction({
                userId: auth.userId,
                newsId,
                interactionType: type,
            });

            // Recalculate counts
            await storage.recalculateNewsCounts(newsId);

            // Check for new badges
            await storage.checkAndAwardBadges(auth.userId);

            return authRes.status(201).json(interaction);
        } catch (error: any) {
            console.error('Create interaction error:', error);
            return authRes.status(500).json({ message: 'Erro ao registrar interação' });
        }
    })(req, res);
}
