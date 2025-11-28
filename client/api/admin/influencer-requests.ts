import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/db-helpers';
import { requireAdmin } from '../_lib/auth-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    return requireAdmin(async (authReq, authRes) => {
        try {
            const { status } = authReq.query;
            const requests = await storage.getAllInfluencerRequests(status as string);
            return authRes.status(200).json(requests);
        } catch (error: any) {
            console.error('Get influencer requests error:', error);
            return authRes.status(500).json({ message: 'Erro ao buscar solicitações' });
        }
    })(req, res);
}
