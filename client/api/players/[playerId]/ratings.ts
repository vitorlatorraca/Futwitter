import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/db-helpers';
import { requireAuth } from '../_lib/auth-helpers';
import { insertPlayerRatingSchema } from '../../shared/schema';

async function handleGet(req: VercelRequest, res: VercelResponse) {
    try {
        const { playerId } = req.query;

        if (!playerId || typeof playerId !== 'string') {
            return res.status(400).json({ message: 'Player ID é obrigatório' });
        }

        const ratings = await storage.getPlayerRatings(playerId);
        const average = await storage.getPlayerAverageRating(playerId);

        return res.status(200).json({ ratings, average });
    } catch (error: any) {
        console.error('Get ratings error:', error);
        return res.status(500).json({ message: 'Erro ao buscar avaliações' });
    }
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
    return requireAuth(async (authReq, authRes) => {
        try {
            const { playerId } = authReq.query;
            const auth = authReq.auth!;

            if (!playerId || typeof playerId !== 'string') {
                return authRes.status(400).json({ message: 'Player ID é obrigatório' });
            }

            const ratingData = insertPlayerRatingSchema.parse(authReq.body);

            const rating = await storage.createPlayerRating({
                ...ratingData,
                playerId,
                userId: auth.userId,
            });

            // Check for new badges
            await storage.checkAndAwardBadges(auth.userId);

            return authRes.status(201).json(rating);
        } catch (error: any) {
            console.error('Create rating error:', error);
            return authRes.status(400).json({
                message: error.message || 'Erro ao criar avaliação'
            });
        }
    })(req, res);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'GET') {
        return handleGet(req, res);
    }

    if (req.method === 'POST') {
        return handlePost(req, res);
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
