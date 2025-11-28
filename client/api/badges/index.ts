import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/db-helpers';
import { requireAuth } from '../_lib/auth-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    return requireAuth(async (authReq, authRes) => {
        try {
            const auth = authReq.auth!;
            const userBadges = await storage.getUserBadges(auth.userId);
            const allBadges = await storage.getAllBadges();

            const badgesWithStatus = allBadges.map(badge => {
                const userBadge = userBadges.find(ub => ub.badge.id === badge.id);
                return {
                    ...badge,
                    unlocked: !!userBadge,
                    earnedAt: userBadge?.earnedAt || null,
                };
            });

            return authRes.status(200).json(badgesWithStatus);
        } catch (error: any) {
            console.error('Get badges error:', error);
            return authRes.status(500).json({ message: 'Erro ao buscar badges' });
        }
    })(req, res);
}
