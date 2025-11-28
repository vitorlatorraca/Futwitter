import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../_lib/db-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { teamId } = req.query;
        const limit = parseInt((req.query.limit as string) || '3');

        if (!teamId || typeof teamId !== 'string') {
            return res.status(400).json({ message: 'Team ID é obrigatório' });
        }

        const upcoming = await storage.getUpcomingMatches(teamId, limit);
        return res.status(200).json(upcoming);
    } catch (error: any) {
        console.error('Get upcoming matches error:', error);
        return res.status(500).json({ message: 'Erro ao buscar próximos jogos' });
    }
}
