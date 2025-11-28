import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/db-helpers';
import { requireAuth } from '../_lib/auth-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    return requireAuth(async (authReq, authRes) => {
        try {
            const auth = authReq.auth!;
            const newBadges = await storage.checkAndAwardBadges(auth.userId);
            return authRes.status(200).json(newBadges);
        } catch (error: any) {
            console.error('Check badges error:', error);
            return authRes.status(500).json({ message: 'Erro ao verificar badges' });
        }
    })(req, res);
}
